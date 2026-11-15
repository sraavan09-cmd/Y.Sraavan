# Lab 4: User Registration, Login & JWT Authentication

> **🔗 Deployment Status:** [https://y-sraavan.onrender.com](https://y-sraavan.onrender.com)  
> *(Note: Render free tier uses an ephemeral filesystem. See [Deployment Notes](#-deployment--persistence-notes) for SQLite persistent storage details.)*

---

## 📋 Student Information

| Field | Details |
| :--- | :--- |
| **Name** | Yarraballi Sraavan |
| **Registration Number** | 252U1R1264 |
| **Section** | CSE-2E 211 |
| **Course** | Backend Development Fundamentals · Year II Term II |
| **Faculty** | Mr Yugandhar Gurjalwar |
| **College** | Aurora Deemed-to-be-University |

---

## 📖 Project Overview

This lab implements a secure authentication and authorization foundation for a Node.js & Express RESTful API with SQLite database integration. The project covers:
1. **User Registration (`POST /register/`)**: Strict input validation, minimum password length enforcement, duplicate username detection, and secure password hashing using `bcrypt` (10 salt rounds).
2. **User Login (`POST /login/`)**: Authenticating user credentials against stored bcrypt password hashes using `bcrypt.compare()`.
3. **JSON Web Token Generation (`jwt.sign()`)**: Generating cryptographically signed, stateless JWT tokens upon successful login, containing only non-sensitive claims (`username`) in the payload.
4. **Existing Books REST API**: Retaining all verified CRUD endpoints from Lab 2 and query parameter filters from Lab 3.
5. **Security Best Practices**: Parameterized SQL queries (`?`) to prevent SQL injection, constant-time password hash comparison to prevent timing attacks, and strict prohibition of plain-text passwords in logs, databases, and token payloads.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime environment (v18+) |
| **Express.js** | Fast, unopinionated web framework for HTTP routing and middleware |
| **SQLite3 & sqlite** | Asynchronous, promise-based relational database client and driver |
| **bcrypt** | Cryptographic password hashing library implementing adaptive hashing and unique salting |
| **jsonwebtoken (JWT)** | Compact, URL-safe standard (RFC 7519) for transmitting claims between parties |
| **nodemon** | Development tool that automatically restarts the node application on file changes |
| **Postman** | API development, automated testing, and endpoint verification tool |

---

## 📁 Project Directory Structure

```text
lab-04/
├── server.js                              # Main Express application & API route handlers
├── package.json                           # Project manifest, scripts, and dependencies
├── package-lock.json                      # Deterministic lockfile for installed packages
├── database.db                            # SQLite database file containing 'user' and 'book' tables
├── .gitignore                             # Ignores node_modules/, .env, and local artifacts
├── .env.example                           # Example environment variable template (no real secrets)
├── .node-version                          # Node runtime version pin (20.18.0)
├── README.md                              # Comprehensive lab documentation & viva guide
├── postman/
│   └── Lab4.postman_collection.json       # Automated Postman test collection
└── screenshots/                           # Verification screenshots
    ├── 01-register-success.png
    ├── 02-register-user-already-exists.png
    ├── 03-register-validation-errors.png
    ├── 04-login-success-jwt.png
    ├── 05-login-invalid-user.png
    ├── 06-login-invalid-password.png
    ├── 07-sqlite-cli-user-table-hashes.png
    ├── 08-jwt-io-decoded-token.png
    └── 09-terminal-server-running.png
```

---

## ⚙️ Installation & Running Locally

### 1. Navigate to Lab 4 Directory
```bash
cd lab-04
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` (optional in development; defaults are provided in `server.js`):
```bash
cp .env.example .env
```
Sample `.env` contents:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Start the Application
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode (with auto-restart):**
  ```bash
  npm run dev
  ```

Server will output:
```text
Server is running at http://localhost:3000
```

---

## 🗄️ Database Schema

### `user` Table
```sql
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);
```

- `id`: Auto-incrementing integer uniquely identifying each user account.
- `username`: Unique username string used for login credentials.
- `name`: Full display name of the registered student/user.
- `password`: Stores **ONLY** the 60-character bcrypt hash string (format: `$2b$10$...`). Plain-text passwords are never stored.

### `book` Table (Retained from Labs 2 & 3)
```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER NOT NULL
);
```

---

## 🚀 API Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API directory & student info | `200 OK` |
| `POST` | `/register/` | Register new user with bcrypt password hash | `201 Created` / `400 Bad Request` |
| `POST` | `/login/` | Authenticate user & return signed JWT token | `200 OK` / `400 Bad Request` |
| `GET` | `/books/` | List books with search, sort, pagination & price filters | `200 OK` |
| `GET` | `/books/:bookId/` | Retrieve a single book by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `POST` | `/books/` | Add a new book to the database | `201 Created` / `400 Bad Request` |
| `PUT` | `/books/:bookId/` | Update an existing book's details | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/books/:bookId/` | Remove a book from the database | `200 OK` / `400 Bad Request` / `404 Not Found` |

---

## 🔐 Authentication Details

### 1. `POST /register/`
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "sraavan_test",
    "name": "Yarraballi Sraavan",
    "password": "securePassword123"
  }
  ```
- **Validation Rules:**
  - `username`, `name`, and `password` must be present, non-empty strings. Missing fields return `400 Bad Request` with `{"message": "Username, name, and password are required"}`.
  - `password.length` must be at least 6 characters. Shorter passwords return `400 Bad Request` with `{"message": "Password is too short. Minimum length is 6 characters"}`.
  - `username` must not already exist in the `user` table. Duplicates return `400 Bad Request` with `{"message": "User already exists"}`.
- **Success Response (`201 Created`):**
  ```json
  {
    "message": "User created successfully"
  }
  ```

### 2. `POST /login/`
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "username": "sraavan_test",
    "password": "securePassword123"
  }
  ```
- **Validation Rules:**
  - `username` and `password` must be present and non-empty. Missing fields return `400 Bad Request` with `{"message": "Username and password are required"}`.
  - If username is not found in database, returns `400 Bad Request` with `{"message": "Invalid user"}`.
  - If `bcrypt.compare(password, dbUser.password)` returns `false`, returns `400 Bad Request` with `{"message": "Invalid password"}`.
- **Success Response (`200 OK`):**
  ```json
  {
    "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNyYWF2YW5fdGVzdCIsImlhdCI6MTc5NDczMTU0NSwiZXhwIjoxNzk0NzM1MTQ1fQ.rHqc-EQU8SAMTrxG5Xtyuxaf_MLdhtPRhNnsK9RT2rw"
  }
  ```

---

## 🧪 SQLite CLI Verification

To inspect the SQLite database and verify that plain-text passwords are never stored:

```bash
sqlite3 database.db
```

Run the following SQLite CLI commands:
```sql
.headers on
.mode column

-- View all registered user accounts:
SELECT id, username, name, password FROM user;
```

### Real Output:
```text
id  username      name                password
--  ------------  ------------------  --------------------------------------------------------------
1   sraavan_test  Yarraballi Sraavan  $2b$10$hMiKZxRrAEUoiC7d30/wC.f3ry7S75neO/NsB2SosiucamnLAorIu
2   alex_turner   Alex Turner         $2b$10$AoqPoMPAC1PJpwZjtzPbaeNmz.YgqqR41J2O5usZAO2AhAI3Le9vO
```

### Critical Observations:
1. **Hashes Only:** The `password` column contains only 60-character bcrypt hash strings starting with `$2b$10$`. The plain-text password `securePassword123` is never stored.
2. **Bcrypt Salting:** Even though `sraavan_test` and `alex_turner` were registered with the **exact same password** (`securePassword123`), their stored hashes are completely different:
   - User 1: `$2b$10$hMiKZxRrAEUoiC7d30/wC...`
   - User 2: `$2b$10$AoqPoMPAC1PJpwZjtzPbae...`
   This occurs because bcrypt generates a unique 128-bit random salt for every registration, completely defeating rainbow table and precomputed dictionary attacks.
3. **Unique Username Constraint:** Attempting to insert another record with `username = 'sraavan_test'` triggers SQLite's `UNIQUE constraint failed: user.username` error.

---

## 🔑 JWT Structure & Decoding (jwt.io)

A JSON Web Token (JWT) is composed of three parts separated by periods (`.`):
$$\text{JWT} = \text{Header} \ .\ \text{Payload} \ .\ \text{Signature}$$

### Real Token Generated by Server:
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNyYWF2YW5fdGVzdCIsImlhdCI6MTc5NDczMTU0NSwiZXhwIjoxNzk0NzM1MTQ1fQ.rHqc-EQU8SAMTrxG5Xtyuxaf_MLdhtPRhNnsK9RT2rw
```

### 1. Header (Red)
Identifies the cryptographic algorithm and token type:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
Encoded in Base64URL: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### 2. Payload (Purple)
Contains the user claims and metadata:
```json
{
  "username": "sraavan_test",
  "iat": 1794731545,
  "exp": 1794735145
}
```
- `username`: Custom claim identifying the authenticated user.
- `iat`: "Issued At" Unix epoch timestamp.
- `exp`: "Expiration Time" Unix epoch timestamp (set to 1 hour after issue).

> [!IMPORTANT]
> The payload is only Base64URL-encoded, **NOT encrypted**. Anyone with the token can decode and view the payload. Therefore, passwords, bcrypt hashes, API keys, or personally identifiable financial data must **NEVER** be placed in the JWT payload.

### 3. Signature (Blue)
Created by combining the encoded header and payload with the server's private secret key using HMAC SHA-256:
```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```
The signature allows the backend to verify that the token was genuinely created by this server and that the payload has not been modified by an attacker.

### How to Verify on jwt.io:
1. Open [https://jwt.io](https://jwt.io).
2. Paste the token into the **Encoded** textarea on the left.
3. Observe the decoded **Header** and **Payload** on the right.
4. In the **Verify Signature** box, enter the secret key: `AURORA_BDS_LAB4_JWT_SECRET_DEV_KEY`.
5. The status will update to **"Signature Verified"**.

---

## 📊 Postman Test Results Table

All test cases have been executed against the running Express application:

| Test ID | Endpoint | Method | Request Payload | Expected Status | Real Status | Expected Response Body | Verification Result |
| :---: | :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **TC-01** | `/register/` | POST | `{ "username": "sraavan_test", "name": "Yarraballi Sraavan", "password": "securePassword123" }` | `201 Created` | `201 Created` | `{"message": "User created successfully"}` | ✅ PASS |
| **TC-02** | `/register/` | POST | `{ "username": "sraavan_test", "name": "Duplicate User", "password": "anotherPassword456" }` | `400 Bad Request` | `400 Bad Request` | `{"message": "User already exists"}` | ✅ PASS |
| **TC-03** | `/register/` | POST | `{ "username": "test_user" }` (missing name, password) | `400 Bad Request` | `400 Bad Request` | `{"message": "Username, name, and password are required"}` | ✅ PASS |
| **TC-04** | `/register/` | POST | `{ "username": "short_pwd", "name": "User", "password": "123" }` | `400 Bad Request` | `400 Bad Request` | `{"message": "Password is too short. Minimum length is 6 characters"}` | ✅ PASS |
| **TC-05** | `/login/` | POST | `{ "username": "sraavan_test", "password": "securePassword123" }` | `200 OK` | `200 OK` | `{"jwt_token": "eyJhbG..."}` | ✅ PASS |
| **TC-06** | `/login/` | POST | `{ "username": "unknown_user_999", "password": "securePassword123" }` | `400 Bad Request` | `400 Bad Request` | `{"message": "Invalid user"}` | ✅ PASS |
| **TC-07** | `/login/` | POST | `{ "username": "sraavan_test", "password": "wrongPassword999" }` | `400 Bad Request` | `400 Bad Request` | `{"message": "Invalid password"}` | ✅ PASS |
| **TC-08** | `/login/` | POST | `{ "username": "sraavan_test" }` (missing password) | `400 Bad Request` | `400 Bad Request` | `{"message": "Username and password are required"}` | ✅ PASS |
| **TC-09** | `/` | GET | *(None)* | `200 OK` | `200 OK` | Student info & API directory JSON | ✅ PASS |
| **TC-10** | `/books/` | GET | `?limit=2` | `200 OK` | `200 OK` | Array of book objects from SQLite | ✅ PASS |
| **TC-11** | `/unknown/` | GET | *(None)* | `404 Not Found` | `404 Not Found` | `{"message": "Route not found"}` | ✅ PASS |

---

## 📸 Screenshots

Save the required verification screenshots in `lab-04/screenshots/`:

| No. | Screenshot Description | File Reference |
| :---: | :--- | :--- |
| 1 | POST /register/ - User registered successfully (201 Created) | `screenshots/01-register-success.png` |
| 2 | POST /register/ - Rejection on duplicate username (400 Bad Request) | `screenshots/02-register-user-already-exists.png` |
| 3 | POST /register/ - Validation error on short password or missing fields (400 Bad Request) | `screenshots/03-register-validation-errors.png` |
| 4 | POST /login/ - Successful authentication returning jwt_token (200 OK) | `screenshots/04-login-success-jwt.png` |
| 5 | POST /login/ - Rejection for unregistered user (400 Bad Request) | `screenshots/05-login-invalid-user.png` |
| 6 | POST /login/ - Rejection for incorrect password (400 Bad Request) | `screenshots/06-login-invalid-password.png` |
| 7 | SQLite CLI showing user table with bcrypt hashed passwords | `screenshots/07-sqlite-cli-user-table-hashes.png` |
| 8 | jwt.io showing decoded Header, Payload (username), and Signature | `screenshots/08-jwt-io-decoded-token.png` |
| 9 | Terminal output showing server running and database initialization | `screenshots/09-terminal-server-running.png` |

---

## 💡 Problems Faced & How They Were Solved

1. **Password Security & Hash Storage:**
   - *Problem:* Storing passwords in plain text creates severe security vulnerabilities if the database file is compromised.
   - *Solution:* Implemented `bcrypt.hash(password, 10)` before insertion. Bcrypt automatically applies a random salt and 10 rounds of key stretching ($2^{10} = 1024$ iterations), ensuring rainbow table attacks are ineffective.
2. **Preventing SQL Injection in Authentication:**
   - *Problem:* Constructing SQL queries using string concatenation (e.g. `` `SELECT * FROM user WHERE username = '${username}'` ``) allows attackers to inject malicious SQL (`' OR '1'='1`).
   - *Solution:* Used parameterized queries (`SELECT * FROM user WHERE username = ?`, `[username]`) throughout all registration and login routes.
3. **JWT Payload Exposure:**
   - *Problem:* Beginners often accidentally place sensitive data (such as passwords, password hashes, or email addresses) in the JWT payload.
   - *Solution:* Restricted the token payload strictly to `{ username: dbUser.username }`. Because JWT payloads are Base64URL-encoded rather than encrypted, sensitive credentials must never be included.
4. **Port Conflicts (`EADDRINUSE`):**
   - *Problem:* When nodemon restarts or multiple terminal tabs run simultaneously, port 3000 may become locked.
   - *Solution:* Added an `error` event listener on the HTTP server instance to catch `EADDRINUSE` and display a clear, actionable message advising the developer to terminate the blocking process or set an alternative port using `PORT=3001`.

---

## 🌐 Deployment & Persistence Notes

### SQLite Limitation on Ephemeral Platforms
SQLite is a serverless, file-based database stored directly on the host's filesystem (`database.db`). On free-tier cloud platforms like **Render**, the application container filesystem is **ephemeral**:
- Whenever the container restarts, sleeps after 15 minutes of inactivity, or redeploys, the local filesystem resets to the git repository state.
- Any users registered dynamically via `/register/` during the runtime session are erased upon restart.

### Recommended Solutions for Production Persistence:
1. **Render Persistent Disk:** Attach a persistent volume to the Render web service (e.g., mounted at `/var/data`) and configure `dbPath = path.join("/var/data", "database.db")`.
2. **NxtWave Cloud IDE / Virtual Machine:** Runs on persistent local storage where the filesystem remains intact across restarts.
3. **Client-Server Relational Database:** Transition from SQLite to PostgreSQL (using Neon, Supabase, or ElephantSQL) for production deployments in Lab 8+.

---

## 🎓 Viva Questions & Expert Answers

### Q1: Why must the `POST` HTTP method be used for login instead of `GET`?
**Answer:**
1. **URL Visibility & Security:** `GET` request data is passed via URL query strings (e.g., `/login?username=...&password=...`). URLs are logged in plain text in browser histories, proxy caches, web server access logs, and network monitoring tools. `POST` transmits credentials inside the HTTP request body, which is encrypted when using HTTPS (TLS).
2. **Semantics & Caching:** `GET` requests are intended to be idempotent and safe, meaning browsers and intermediate proxies may cache responses. `POST` requests are never cached by default, preventing unauthorized reuse of authentication responses.
3. **Data Length Limits:** `GET` query strings have length limitations imposed by web browsers and servers, whereas `POST` request bodies support structured JSON payloads without URL length constraints.

### Q2: What is the difference between Hashing and Encryption?
**Answer:**
- **Hashing (One-Way):** Hashing transforms plain-text data into a fixed-length string of characters using a mathematical algorithm. It is irreversible—there is no key to "decrypt" a hash back to the original password. Verification is performed by hashing the incoming password with the same salt and comparing the resulting hashes. Examples: `bcrypt`, `Argon2`, `SHA-256`.
- **Encryption (Two-Way):** Encryption transforms plain-text into ciphertext using an encryption algorithm and a secret key. It is designed to be reversed (decrypted) back to the original plain-text using the corresponding decryption key. Examples: `AES-256`, `RSA`.
- **Why Passwords Use Hashing:** Passwords must never be reversible. If an attacker steals the database, they cannot decrypt the passwords because no decryption key exists.

### Q3: What arguments does `jwt.sign()` require, and what does each do?
**Answer:**
`jwt.sign(payload, secretOrPrivateKey, [options, callback])` requires:
1. **`payload`:** An object, string, or buffer containing the claims/data to be encoded into the token (e.g., `{ username: "sraavan" }`).
2. **`secretOrPrivateKey`:** The secret cryptographic key (for symmetric algorithms like HS256) or private key (for asymmetric algorithms like RS256) used to generate the cryptographic signature.
3. **`options` (Optional):** Configuration parameters such as token expiration (`expiresIn: "1h"`), algorithm (`algorithm: "HS256"`), issuer (`issuer`), and subject (`subject`).

### Q4: What should NEVER be placed in a JWT payload, and why?
**Answer:**
Passwords, password hashes, secret keys, credit card numbers, or any sensitive personal data must **never** be placed in a JWT payload.  
**Reason:** The JWT payload is merely Base64URL-encoded, **not encrypted**. Any person, proxy, browser extension, or network snooper that inspects the token can instantly decode the payload using standard Base64 decoding or tools like [jwt.io](https://jwt.io). The signature guarantees **integrity and authenticity** (that the token was not tampered with), but provides **zero confidentiality**.

### Q5: What is "Salting", and why does `bcrypt` use it?
**Answer:**
A **salt** is a cryptographically strong, random string of bits generated uniquely for every password before hashing.  
**Why it is needed:**
1. **Prevents Rainbow Table Attacks:** Without salts, identical passwords always yield identical hashes. Attackers precompute tables containing millions of hashed common passwords (rainbow tables) to instantly reverse stolen hashes. A unique salt ensures that precomputed tables cannot be used.
2. **Prevents Identical Hash Collisions:** If two users choose the same password (e.g. `password123`), hashing with unique salts produces two completely different stored hash strings.
3. **Automatic Management in bcrypt:** `bcrypt` automatically generates the salt, embeds it directly within the resulting 60-character hash string (`$2b$10$[22-character salt][31-character hash]`), and extracts it automatically during `bcrypt.compare()`.

### Q6: What is the difference between Stateful (Session-based) and Stateless (JWT-based) Authentication?
**Answer:**
- **Stateful (Session-based):** The server creates a session record in server memory or a database (e.g., Redis) and sends a Session ID cookie to the client. On every request, the server must look up the session in its database to verify the user. This creates a stateful dependency that requires session synchronization across clustered server instances.
- **Stateless (JWT-based):** The server does not store any session state in its database. All necessary information (user identity, expiration) is self-contained inside the cryptographically signed token held by the client. Any server instance sharing the secret key can verify the token independently without querying a database, allowing horizontal scaling.

---

## 👤 Author

**Yarraballi Sraavan**  
Registration Number: **252U1R1264**  
Section: **CSE-2E 211**  
Department of Computer Science & Engineering  
Aurora Deemed-to-be-University

