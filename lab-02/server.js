const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "database.db");

// Middleware to parse JSON request bodies
app.use(express.json());

let db = null;

// Initialize database connection and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the book table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    // Check if table is empty, if so insert 10 sample books
    const count = await db.get("SELECT COUNT(*) as total FROM book");
    if (count.total === 0) {
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
        ('The Great Gatsby', 'F. Scott Fitzgerald', 350, 180),
        ('To Kill a Mockingbird', 'Harper Lee', 400, 281),
        ('1984', 'George Orwell', 300, 328),
        ('Pride and Prejudice', 'Jane Austen', 280, 432),
        ('The Alchemist', 'Paulo Coelho', 250, 197),
        ('Sapiens', 'Yuval Noah Harari', 550, 498),
        ('The Lean Startup', 'Eric Ries', 480, 336),
        ('Deep Work', 'Cal Newport', 420, 304),
        ('Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 336),
        ('The Psychology of Money', 'Morgan Housel', 400, 256)
      `);
      console.log("Inserted 10 sample books into database.");
    }

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ==========================================
// CRUD API ENDPOINTS
// ==========================================

// 1. GET /books/ - Retrieve all books
app.get("/books/", async (req, res) => {
  try {
    // Parameterized queries prevent SQL injection by treating user input as data, not code
    const query = "SELECT * FROM book";
    const books = await db.all(query);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /books/:bookId/ - Retrieve a single book by ID
app.get("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    // Using ? placeholder to prevent SQL injection
    const query = "SELECT * FROM book WHERE id = ?";
    const book = await db.get(query, [bookId]);

    if (book === undefined) {
      res.status(404).json({ error: "Book not found" });
    } else {
      res.status(200).json(book);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /books/ - Add a new book
app.post("/books/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    // Validate request body
    if (!title || !author || !price || !pages) {
      return res.status(400).json({
        error: "All fields are required: title, author, price, pages",
      });
    }

    // Using ? placeholders to prevent SQL injection
    const query =
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)";
    const result = await db.run(query, [title, author, price, pages]);

    res.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT /books/:bookId/ - Update an existing book
app.put("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    // Check if the book exists
    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);
    if (existingBook === undefined) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Validate request body
    if (!title || !author || !price || !pages) {
      return res.status(400).json({
        error: "All fields are required: title, author, price, pages",
      });
    }

    // Using ? placeholders to prevent SQL injection
    const query =
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?";
    await db.run(query, [title, author, price, pages, bookId]);

    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE /books/:bookId/ - Delete a book
app.delete("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check if the book exists
    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);
    if (existingBook === undefined) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Using ? placeholder to prevent SQL injection
    const query = "DELETE FROM book WHERE id = ?";
    await db.run(query, [bookId]);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

