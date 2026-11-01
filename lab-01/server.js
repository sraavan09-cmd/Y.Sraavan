// ============================================
// Lab 1: Express.js Server
// Student: Reddemoni Manikanta
// Registration Number: 252U1R1220
// Section: CSE-2E 211
// ============================================

// Step 1: Import the Express module
// Express is a third-party framework for Node.js that makes it easy
// to create web servers and handle HTTP requests.
// We install it using: npm install express
const express = require("express");

// Step 2: Initialize the Express application
// express() creates a new Express application instance.
// We store it in the variable 'app' and use it to define routes and middleware.
const app = express();

// Step 3: Define the port
// process.env.PORT allows the port to be set by the hosting platform (like Render)
// If no environment variable is set, it defaults to 3000 for local development
const PORT = process.env.PORT || 3000;

// ============================================
// ROUTES
// ============================================

// Route 1: GET /
// This is the home/welcome route.
// When someone visits the root URL, they see a welcome message.
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Backend Development Fundamentals Lab 1!",
    student: "Reddemoni Manikanta",
    lab: "Lab 1 - Node.js and Express Server",
  });
});

// Route 2: GET /about
// This route returns information about the student in JSON format.
// JSON (JavaScript Object Notation) is a common data format used in APIs.
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Reddemoni Manikanta",
    registrationNumber: "252U1R1220",
    section: "CSE-2E 211",
    course: "Backend Development Fundamentals",
    college: "Aurora",
  });
});

// Route 3: GET /time
// This route returns the current date and time.
// new Date() creates a JavaScript Date object with the current timestamp.
app.get("/time", (req, res) => {
  const currentTime = new Date();
  res.status(200).json({
    currentDateTime: currentTime.toString(),
    isoFormat: currentTime.toISOString(),
    message: "This is the current server date and time.",
  });
});

// ============================================
// 404 ERROR HANDLING MIDDLEWARE
// ============================================

// This middleware catches all requests that don't match any defined route.
// app.use() without a path runs for every request.
// Since this is placed AFTER all routes, it only runs if no route matched.
// It returns a 404 status code, meaning "Not Found".
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route '${req.originalUrl}' does not exist on this server.`,
    statusCode: 404,
  });
});

// ============================================
// START THE SERVER
// ============================================

// app.listen() starts the Express server on the specified port.
// It takes the port number and an optional callback function.
// The callback runs once the server is ready to accept requests.
app.listen(PORT, () => {
  console.log(`✅ Express Server is running at http://localhost:${PORT}`);
  console.log(`📌 Available routes:`);
  console.log(`   GET /       → Welcome message`);
  console.log(`   GET /about  → Student information`);
  console.log(`   GET /time   → Current date and time`);
  console.log(`🛑 Press Ctrl + C to stop the server`);
});
