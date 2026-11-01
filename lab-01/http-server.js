// ============================================
// Lab 1: Plain Node.js HTTP Server
// Student: Reddemoni Manikanta
// Registration Number: 252U1R1220
// Section: CSE-2E 211
// ============================================

// Step 1: Import the built-in 'http' module
// The 'http' module is built into Node.js, so we don't need to install it.
// It allows us to create a web server that can handle HTTP requests.
const http = require("http");

// Step 2: Define the port number
// The server will listen for incoming requests on this port.
const PORT = 3000;

// Step 3: Create the HTTP server using http.createServer()
// The createServer() method takes a callback function with two parameters:
// - req (request): Contains information about the incoming request (URL, method, headers, etc.)
// - res (response): Used to send a response back to the client (browser)
const server = http.createServer((req, res) => {
  // Step 4: Set the response header
  // We tell the browser that we are sending plain text content
  // Status code 200 means "OK" – the request was successful
  res.writeHead(200, { "Content-Type": "text/plain" });

  // Step 5: Send the response body and end the response
  // res.end() sends the response to the client and signals that the response is complete
  res.end("Hello");
});

// Step 6: Start the server and listen on the specified port
// The server will now wait for incoming HTTP requests on port 3000
server.listen(PORT, () => {
  // This callback runs once the server starts successfully
  console.log(`✅ Node.js HTTP Server is running at http://localhost:${PORT}`);
  console.log(`📌 Open your browser and visit: http://localhost:${PORT}`);
  console.log(`🛑 Press Ctrl + C to stop the server`);
});

