const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "database.db");

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    const count = await db.get("SELECT COUNT(*) as total FROM book");
    if (count.total === 0) {
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
        ('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 790, 448)
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

// Root route - Welcome and API information
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Backend Development Fundamentals - Lab 2 (SQLite Database and CRUD Routes)",
    student: "Yarraballi Sraavan",
    registrationNumber: "252U1R1264",
    section: "CSE-2E 211",
    college: "Aurora Deemed-to-be-University",
    endpoints: {
      getAllBooks: "GET /books/",
      getSingleBook: "GET /books/:bookId/",
      addBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

app.get("/books/", async (req, res) => {
  try {
    const query = "SELECT * FROM book";
    const books = await db.all(query);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const query = "SELECT * FROM book WHERE id = ?";
    const book = await db.get(query, [bookId]);

    if (book === undefined) {
      res.status(404).json({
        error: "Not Found",
        message: `Book with ID ${bookId} not found.`
      });
    } else {
      res.status(200).json(book);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/books/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (!title || !author || !price || !pages) {
      return res.status(400).json({
        error: "All fields are required: title, author, price, pages",
      });
    }

    const query =
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)";
    const result = await db.run(query, [title, author, price, pages]);

    res.status(201).json({
      message: "Book Added Successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);
    if (existingBook === undefined) {
      return res.status(404).json({
        error: "Not Found",
        message: `Book with ID ${bookId} not found.`
      });
    }

    if (!title || !author || !price || !pages) {
      return res.status(400).json({
        error: "All fields are required: title, author, price, pages",
      });
    }

    const query =
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?";
    await db.run(query, [title, author, price, pages, bookId]);

    res.status(200).json({ message: "Book Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [
      bookId,
    ]);
    if (existingBook === undefined) {
      return res.status(404).json({
        error: "Not Found",
        message: `Book with ID ${bookId} not found.`
      });
    }

    const query = "DELETE FROM book WHERE id = ?";
    await db.run(query, [bookId]);

    res.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
