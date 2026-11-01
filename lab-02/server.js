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
      res.status(404).json({ error: "Book not found" });
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
      message: "Book added successfully",
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
      return res.status(404).json({ error: "Book not found" });
    }

    if (!title || !author || !price || !pages) {
      return res.status(400).json({
        error: "All fields are required: title, author, price, pages",
      });
    }

    const query =
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?";
    await db.run(query, [title, author, price, pages, bookId]);

    res.status(200).json({ message: "Book updated successfully" });
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
      return res.status(404).json({ error: "Book not found" });
    }

    const query = "DELETE FROM book WHERE id = ?";
    await db.run(query, [bookId]);

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
