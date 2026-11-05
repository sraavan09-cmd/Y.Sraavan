const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Backend Development Fundamentals Lab 1!",
    student: "Yarraballi Sraavan",
    lab: "Lab 1 - Node.js and Express Server",
  });
});

app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Yarraballi Sraavan",
    registrationNumber: "252U1R1264",
    section: "CSE-2E 211",
    course: "Backend Development Fundamentals",
    college: "Aurora Deemed-to-be-University",
  });
});

app.get("/time", (req, res) => {
  const currentTime = new Date();
  res.status(200).json({
    currentDateTime: currentTime.toString(),
    isoFormat: currentTime.toISOString(),
    message: "This is the current server date and time.",
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route '${req.originalUrl}' does not exist on this server.`,
    statusCode: 404,
  });
});

app.listen(PORT, () => {
  console.log(`Express Server is running at http://localhost:${PORT}`);
});
