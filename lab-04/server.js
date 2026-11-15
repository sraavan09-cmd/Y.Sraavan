const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "database.db");

// ==========================================
// SECRET KEY CONFIGURATION
// ==========================================
// Secret key used to sign and verify JSON Web Tokens (JWT).
// NOTE FOR LAB 8: This secret key will move to an environment variable (.env).
// In production systems, secret keys must NEVER be hardcoded or committed to git.
const JWT_SECRET = process.env.JWT_SECRET || "AURORA_BDS_LAB4_JWT_SECRET_DEV_KEY";

// ==========================================
// MIDDLEWARE
// ==========================================
// Built-in middleware to parse incoming JSON request bodies into req.body
app.use(express.json());

let db = null;

// ==========================================
// DATABASE INITIALIZATION & SERVER STARTUP
// ==========================================
const initializeDBAndServer = async () => {
  try {
    // 1. Open SQLite database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // 2. Create the 'user' table if it doesn't already exist
    // - id: Auto-incrementing unique primary key
    // - username: Unique identifier for login (no duplicates allowed)
    // - name: Full display name of the user
    // - password: Stores ONLY the bcrypt hash (never plain text!)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // 3. Create the 'book' table (retained from Lab 2 & Lab 3)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    // 4. Ensure book table has initial records for testing
    const count = await db.get("SELECT COUNT(*) as total FROM book");
    if (count.total < 15) {
      await db.exec(`DELETE FROM book`);
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
        ('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 750, 352),
        ('Clean Code', 'Robert C. Martin', 650, 464),
        ('You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 420, 144),
        ('Designing Data-Intensive Applications', 'Martin Kleppmann', 1200, 616),
        ('JavaScript: The Good Parts', 'Douglas Crockford', 380, 176),
        ('Atomic Habits', 'James Clear', 450, 320),
        ('Node.js Design Patterns', 'Mario Casciaro', 890, 660),
        ('Learning SQL', 'Alan Beaulieu', 550, 380),
        ('Introduction to Algorithms', 'Thomas H. Cormen', 1400, 1312),
        ('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 790, 448),
        ('Cracking the Coding Interview', 'Gayle Laakmann McDowell', 950, 687),
        ('Head First Design Patterns', 'Eric Freeman', 720, 694),
        ('Eloquent JavaScript', 'Marijn Haverbeke', 499, 472),
        ('Clean Architecture', 'Robert C. Martin', 680, 432),
        ('Database System Concepts', 'Abraham Silberschatz', 1150, 1376)
      `);
      console.log("Seeded database with initial book records.");
    }

    // 5. Start the HTTP server
    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

    // Handle port collision gracefully (EADDRINUSE)
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `[Port Conflict] Port ${PORT} is in use. Terminate running process or use PORT=<number>.`
        );
      } else {
        console.error(`[Server Error] ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ==========================================
// ROOT ROUTE: API DIRECTORY & STUDENT INFO
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Backend Development Fundamentals - Lab 4 (User Registration, Login & JWT)",
    student: "Yarraballi Sraavan",
    registrationNumber: "252U1R1264",
    section: "CSE-2E 211",
    college: "Aurora Deemed-to-be-University",
    faculty: "Mr Yugandhar Gurjalwar",
    endpoints: {
      register: "POST /register/",
      login: "POST /login/",
      listBooksWithFilters: "GET /books/?search_q=&order_by=id&order=ASC&limit=10&offset=0&min_price=&max_price=",
      getSingleBook: "GET /books/:bookId/",
      addBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

// ==========================================
// 1. POST /register/ - USER REGISTRATION
// ==========================================
// Request Body: { "username": "...", "name": "...", "password": "..." }
app.post("/register/", async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    // A. Validate mandatory fields exist and are non-empty strings
    if (
      !username ||
      !name ||
      !password ||
      typeof username !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      name.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        message: "Username, name, and password are required",
      });
    }

    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    // B. Enforce minimum password length (must be at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password is too short. Minimum length is 6 characters",
      });
    }

    // C. Check if username is already registered (parameterized query prevents SQL injection)
    const selectUserQuery = "SELECT * FROM user WHERE username = ?";
    const existingUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // D. Hash the plain-text password with bcrypt (salt rounds = 10)
    // bcrypt automatically creates a unique cryptographically secure salt for every hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // E. Insert new user into SQLite table using parameterized query
    // NEVER store plain text passwords in the database!
    const insertUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?)
    `;
    await db.run(insertUserQuery, [trimmedUsername, trimmedName, hashedPassword]);

    // F. Return success response (never echo back password or hash)
    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. POST /login/ - USER AUTHENTICATION & JWT
// ==========================================
// Request Body: { "username": "...", "password": "..." }
app.post("/login/", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // A. Validate required fields
    if (
      !username ||
      !password ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const trimmedUsername = username.trim();

    // B. Query database for user record (parameterized query)
    const selectUserQuery = "SELECT * FROM user WHERE username = ?";
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    // C. If user does not exist, return 400
    if (!dbUser) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    // D. Compare incoming plain password with the stored bcrypt hash
    // bcrypt extracts the salt from dbUser.password, hashes the incoming password,
    // and performs a constant-time comparison to prevent timing attacks
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // E. Authentication succeeded -> Generate JSON Web Token (JWT)
    // jwt.sign() requires 3 core arguments:
    // 1. payload: Object containing user claims (ONLY username; never password/hash!)
    // 2. secretKey: Private cryptographic key used to create the HMAC signature
    // 3. options: Token configuration such as expiry time ({ expiresIn: "1h" })
    const payload = {
      username: dbUser.username,
    };

    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // F. Return token in JSON response
    return res.status(200).json({
      jwt_token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. EXISTING BOOKS CRUD ROUTES (FROM LAB 3)
// ==========================================

// GET /books/ - Retrieve books with search, sort, pagination, and price filters
app.get("/books/", async (req, res, next) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = 10,
      offset = 0,
      min_price = "",
      max_price = "",
    } = req.query;

    const allowedOrderBy = ["id", "title", "author", "price", "pages"];
    const sanitizedOrderBy = allowedOrderBy.includes(order_by) ? order_by : "id";

    const normalizedOrder = order.toUpperCase();
    const sanitizedOrder = normalizedOrder === "DESC" ? "DESC" : "ASC";

    const parsedLimit = Number(limit);
    const sanitizedLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

    const parsedOffset = Number(offset);
    const sanitizedOffset = Number.isInteger(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;

    let whereConditions = [];
    let queryParams = [];

    if (search_q.trim() !== "") {
      whereConditions.push("(title LIKE ? OR author LIKE ?)");
      const searchPattern = `%${search_q.trim()}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    if (min_price !== "") {
      const parsedMinPrice = Number(min_price);
      if (Number.isFinite(parsedMinPrice) && parsedMinPrice >= 0) {
        whereConditions.push("price >= ?");
        queryParams.push(parsedMinPrice);
      }
    }

    if (max_price !== "") {
      const parsedMaxPrice = Number(max_price);
      if (Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0) {
        whereConditions.push("price <= ?");
        queryParams.push(parsedMaxPrice);
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const query = `
      SELECT *
      FROM book
      ${whereClause}
      ORDER BY ${sanitizedOrderBy} ${sanitizedOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(sanitizedLimit, sanitizedOffset);
    const books = await db.all(query, queryParams);

    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

// GET /books/:bookId/ - Retrieve a single book by ID
app.get("/books/:bookId/", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    const query = "SELECT * FROM book WHERE id = ?";
    const book = await db.get(query, [parsedId]);

    if (!book) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

// POST /books/ - Add a new book
app.post("/books/", async (req, res, next) => {
  try {
    const { title, author, price, pages } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Field 'title' is required and must be a non-empty string" });
    }
    if (!author || typeof author !== "string" || author.trim() === "") {
      return res.status(400).json({ message: "Field 'author' is required and must be a non-empty string" });
    }
    if (price === undefined || typeof price !== "number" || price < 0) {
      return res.status(400).json({ message: "Field 'price' is required and must be a non-negative number" });
    }
    if (pages === undefined || !Number.isInteger(pages) || pages <= 0) {
      return res.status(400).json({ message: "Field 'pages' is required and must be a positive integer" });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?)
    `;
    const result = await db.run(query, [title.trim(), author.trim(), price, pages]);

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /books/:bookId/ - Update an existing book
app.put("/books/:bookId/", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ message: "Invalid bookId format. Must be a positive integer" });
    }

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [parsedId]);
    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${parsedId} not found` });
    }

    const { title, author, price, pages } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Field 'title' is required and must be a non-empty string" });
    }
    if (!author || typeof author !== "string" || author.trim() === "") {
      return res.status(400).json({ message: "Field 'author' is required and must be a non-empty string" });
    }
    if (price === undefined || typeof price !== "number" || price < 0) {
      return res.status(400).json({ message: "Field 'price' is required and must be a non-negative number" });
    }
    if (pages === undefined || !Number.isInteger(pages) || pages <= 0) {
      return res.status(400).json({ message: "Field 'pages' is required and must be a positive integer" });
    }

    const query = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?
    `;
    await db.run(query, [title.trim(), author.trim(), price, pages, parsedId]);

    res.status(200).json({ message: "Book Updated Successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE /books/:bookId/ - Delete a book
app.delete("/books/:bookId/", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ message: "Invalid bookId format. Must be a positive integer" });
    }

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [parsedId]);
    if (!existingBook) {
      return res.status(404).json({ message: `Book with ID ${parsedId} not found` });
    }

    const query = "DELETE FROM book WHERE id = ?";
    await db.run(query, [parsedId]);

    res.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 404 UNKNOWN ROUTE HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(500).json({ message: "Internal server error" });
});

