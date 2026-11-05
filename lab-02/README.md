# Lab 2: SQLite Database and CRUD Routes

> **🔗 Live Deployment URL:** [https://y-sraavan.onrender.com](https://y-sraavan.onrender.com)

---

## 📋 Student Information

| Field | Details |
|-------|---------|
| **Name** | Yarraballi Sraavan |
| **Registration Number** | 252U1R1264 |
| **Section** | CSE-2E 211 |
| **Course** | Backend Development Fundamentals |
| **Faculty** | Mr Yugandhar Gurjalwar |
| **College** | Aurora Deemed-to-be-University |

---

## 🎯 Objective

Create an Express.js server connected to an SQLite database. Implement full CRUD (Create, Read, Update, Delete) operations on a `book` table using RESTful API endpoints with parameterized SQL queries to prevent SQL injection.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime for server-side programming |
| **Express.js** | Web framework for building REST APIs |
| **SQLite** | Lightweight file-based relational database |
| **sqlite / sqlite3** | Node.js packages to interact with SQLite |
| **nodemon** | Auto-restarts server on file changes during development |
| **Postman** | API testing tool |

---

## 🗄️ Database Structure

**Database File:** `database.db`

**Table:** `book`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Unique book ID |
| `title` | TEXT NOT NULL | Book title |
| `author` | TEXT NOT NULL | Author name |
| `price` | INTEGER NOT NULL | Price in rupees |
| `pages` | INTEGER NOT NULL | Number of pages |

### Sample Data (10 Books)

| ID | Title | Author | Price | Pages |
|----|-------|--------|-------|-------|
| 1 | The Great Gatsby | F. Scott Fitzgerald | 350 | 180 |
| 2 | To Kill a Mockingbird | Harper Lee | 400 | 281 |
| 3 | 1984 | George Orwell | 300 | 328 |
| 4 | Pride and Prejudice | Jane Austen | 280 | 432 |
| 5 | The Alchemist | Paulo Coelho | 250 | 197 |
| 6 | Sapiens | Yuval Noah Harari | 550 | 498 |
| 7 | The Lean Startup | Eric Ries | 480 | 336 |
| 8 | Deep Work | Cal Newport | 420 | 304 |
| 9 | Rich Dad Poor Dad | Robert Kiyosaki | 350 | 336 |
| 10 | The Psychology of Money | Morgan Housel | 400 | 256 |

---

## 🔌 Database Initialization

The function `initializeDBAndServer()` handles:

1. Opens the SQLite database file using `sqlite` and `sqlite3` packages.
2. Creates the `book` table if it doesn't exist.
3. Inserts 10 sample books if the table is empty.
4. Starts the Express server only after a successful database connection.
5. Exits with an error message if the connection fails.

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Steps

1. **Navigate to lab-02:**
   ```bash
   cd lab-02
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Start with auto-reload (development):**
   ```bash
   npm run dev
   ```

5. **Server runs at:** [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

| Method | Path | Live URL | Description | Status Code |
|:---|:---|:---|:---|:---|
| `GET` | `/` | [Open Live Link](https://y-sraavan.onrender.com/) | Welcome message, student details & endpoint list | `200 OK` |
| `GET` | `/books/` | [Open Live Link](https://y-sraavan.onrender.com/books/) | Retrieve all books from SQLite database | `200 OK` |
| `GET` | `/books/:bookId/` | [Open Live Link (ID 1)](https://y-sraavan.onrender.com/books/1/) | Retrieve a single book by ID | `200 OK` / `404 Not Found` |
| `POST` | `/books/` | [API Endpoint](https://y-sraavan.onrender.com/books/) | Add a new book to the database | `201 Created` / `400 Bad Request` |
| `PUT` | `/books/:bookId/` | [API Endpoint (ID 1)](https://y-sraavan.onrender.com/books/1/) | Update an existing book's details | `200 OK` / `404 Not Found` |
| `DELETE` | `/books/:bookId/` | [API Endpoint (ID 1)](https://y-sraavan.onrender.com/books/1/) | Delete a book by ID | `200 OK` / `404 Not Found` |
| `GET` | `/books/999/` | [Open Live Link (404 Test)](https://y-sraavan.onrender.com/books/999/) | Test 404 error response for non-existent book | `404 Not Found` |

---

## 📝 Sample Request Bodies

### POST /books/ (Add a new book)
```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "price": 450,
  "pages": 320
}
```

### PUT /books/:bookId/ (Update a book)
```json
{
  "title": "Atomic Habits (Updated)",
  "author": "James Clear",
  "price": 500,
  "pages": 325
}
```

---

## 📤 Expected Responses

### GET /books/
```json
[
  { "id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 350, "pages": 180 },
  { "id": 2, "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 400, "pages": 281 }
]
```

### GET /books/1/
```json
{ "id": 1, "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 350, "pages": 180 }
```

### POST /books/ (201 Created)
```json
{ "message": "Book added successfully", "bookId": 11 }
```

### PUT /books/11/ (200 OK)
```json
{ "message": "Book updated successfully" }
```

### DELETE /books/11/ (200 OK)
```json
{ "message": "Book deleted successfully" }
```

### GET /books/999/ (404 Not Found)
```json
{ "error": "Book not found" }
```

### POST with missing fields (400 Bad Request)
```json
{ "error": "All fields are required: title, author, price, pages" }
```

---

## 🛡️ SQL Injection Prevention

All SQL queries use **parameterized queries** with `?` placeholders.

**Why is this important?**

Without parameterization, an attacker could inject malicious SQL code through user input (e.g., entering `'; DROP TABLE book; --` as a title). Parameterized queries treat user input strictly as data, never as executable SQL code.

**Examples used in this project:**

```sql
SELECT * FROM book WHERE id = ?
INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)
UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?
DELETE FROM book WHERE id = ?
```

---

## 🧪 SQLite CLI Verification

After performing CRUD operations, verify directly in the database:

```bash
sqlite3 database.db
```

**View all books:**
```sql
SELECT * FROM book;
```

**After POST (verify new book):**
```sql
SELECT * FROM book WHERE title = 'Atomic Habits';
```

**After PUT (verify update):**
```sql
SELECT * FROM book WHERE id = 11;
```

**After DELETE (verify removal):**
```sql
SELECT * FROM book WHERE id = 11;
-- Should return no rows
```

**Exit SQLite CLI:**
```
.exit
```

---

## 📸 Screenshots

### 1. GET All Books (GET /books/)
- **Render Live URL:** [https://y-sraavan.onrender.com/books/](https://y-sraavan.onrender.com/books/)
- **Expected HTTP Status:** `200 OK`

![GET All Books](screenshots/01-get-all-books.png)

### 2. GET One Book (GET /books/1/)
- **Render Live URL:** [https://y-sraavan.onrender.com/books/1/](https://y-sraavan.onrender.com/books/1/)
- **Expected HTTP Status:** `200 OK`

![GET One Book](screenshots/02-get-one-book.png)

### 3. POST New Book (POST /books/)
- **Render Live URL:** [https://y-sraavan.onrender.com/books/](https://y-sraavan.onrender.com/books/)
- **Expected HTTP Status:** `201 Created`

![POST New Book](screenshots/03-post-book.png)

### 4. PUT Update Book (PUT /books/:bookId/)
- **Render Live URL:** [https://y-sraavan.onrender.com/books/13/](https://y-sraavan.onrender.com/books/13/)
- **Expected HTTP Status:** `200 OK`

![PUT Update Book](screenshots/04-put-book.png)

### 5. DELETE Book (DELETE /books/:bookId/)
- **Render Live URL:** [https://y-sraavan.onrender.com/books/13/](https://y-sraavan.onrender.com/books/13/)
- **Expected HTTP Status:** `200 OK`

![DELETE Book](screenshots/05-delete-book.png)

### 6. 404 Error Handling (GET /books/999/ or Unknown Route)
- **Render Live URL:** [https://y-sraavan.onrender.com/books/999/](https://y-sraavan.onrender.com/books/999/)
- **Expected HTTP Status:** `404 Not Found`

![404 Error](screenshots/06-404-error.png)

### 7. SQLite Database: Inserted Record Verification
![SQLite Database Inserted](screenshots/07-sqlite-inserted-records.png)

### 8. SQLite Database: Updated Record Verification
![SQLite Database Updated](screenshots/08-sqlite-updated-records.png)

### 9. SQLite Database: Deleted Record Verification
![SQLite Database Deleted](screenshots/09-sqlite-deleted-records.png)

---

## 🚀 Deployment on Render

### Steps to Deploy

1. **Sign up** on [Render](https://render.com/) using your GitHub account.

2. **Create a New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository: `Y.Sraavan`

3. **Configure the Service:**
   | Setting | Value |
   |---------|-------|
   | **Name** | `sraavan-lab02` |
   | **Root Directory** | `lab-02` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Environment Variable** | `NODE_VERSION: 20.18.0` |

4. **Deploy** and wait for the build to complete.

5. **Verify by visiting the deployed Render URLs:**
   - **Main Server / Student Info:** [https://y-sraavan.onrender.com/](https://y-sraavan.onrender.com/)
   - **GET All Books:** [https://y-sraavan.onrender.com/books/](https://y-sraavan.onrender.com/books/)
   - **GET Single Book (ID 1):** [https://y-sraavan.onrender.com/books/1/](https://y-sraavan.onrender.com/books/1/)
   - **GET Single Book (ID 2):** [https://y-sraavan.onrender.com/books/2/](https://y-sraavan.onrender.com/books/2/)
   - **GET 404 Error Test (ID 999):** [https://y-sraavan.onrender.com/books/999/](https://y-sraavan.onrender.com/books/999/)

---

## ❗ Problems Faced and Solutions

| Problem | Solution |
|---------|----------|
| `Cannot find module 'sqlite'` | Ran `npm install sqlite sqlite3` to install both packages |
| Database not found error | Used `path.join(__dirname, "database.db")` for the correct absolute path |
| POST request body undefined | Added `app.use(express.json())` middleware to parse JSON bodies |
| SQLite on Render resets on redeploy | Documented limitation; used Postman screenshots for verification |
| SQL injection vulnerability | Used parameterized queries with `?` placeholders instead of string concatenation |

---

## 🎓 Viva Questions & Answers

| Question | Answer |
| :--- | :--- |
| **Why await the database call?** | Database operations (I/O) are asynchronous. Using `await` ensures the JavaScript execution waits for the database query to complete and return its result before moving to the next line or sending the HTTP response back to the client. |
| **What is SQL injection and how do placeholders prevent it?** | SQL injection is a security vulnerability where untrusted user input is directly concatenated into SQL statements, allowing attackers to execute unauthorized commands (like deleting tables). Placeholders (`?`) treat input strictly as literal values/parameters rather than executable SQL code, completely neutralizing the attack. |
| **When is PUT used instead of POST?** | `POST` is used to create a **new** resource on the server (non-idempotent, server assigns ID). `PUT` is used to update or replace an **existing** resource at a known URI (e.g., `/books/:bookId/`) and is idempotent (sending the same request multiple times produces the same state). |

---

## ✅ Conclusion

In this lab, I learned:

1. **How to set up an SQLite database** using the `sqlite` and `sqlite3` packages in Node.js.
2. **How to perform CRUD operations** (Create, Read, Update, Delete) through REST API endpoints.
3. **How to use parameterized SQL queries** to prevent SQL injection attacks.
4. **How to validate request data** and return appropriate HTTP status codes (200, 201, 400, 404, 500).
5. **How to initialize a database connection** asynchronously before starting the server.
6. **How to test APIs** using Postman and verify results with SQLite CLI.

---

## 👤 Author

**Yarraballi Sraavan** – 252U1R1264 – CSE-2E 211

