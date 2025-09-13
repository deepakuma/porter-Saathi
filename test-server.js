// // add this at the top
// import fetch from "node-fetch"; // if using ES modules
// // or
// const fetch = require("node-fetch"); // if using CommonJS

// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const app = express();
// const PORT = 3000; // Changed to port 3000

// // Basic middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Request logging
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // Test routes
// app.get("/", (req, res) => {
//   res.json({ message: "Server is running!" });
// });

// // Ping endpoint
// app.get("/ping", (req, res) => {
//   res.json({
//     status: "ok",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime()
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json({ error: err.message });
// });

// // Start server with explicit host binding
// const server = app.listen(PORT, '127.0.0.1', (error) => {
//   if (error) {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   }
//   console.log(`Server is running at http://127.0.0.1:${PORT}`);
//   console.log('Try these test URLs:');
//   console.log(`  http://127.0.0.1:${PORT}/`);
//   console.log(`  http://127.0.0.1:${PORT}/ping`);
// });

// // Handle server errors
// server.on('error', (error) => {
//   if (error.code === 'EADDRINUSE') {
//     console.error(`Port ${PORT} is already in use. Please try a different port.`);
//   } else {
//     console.error('Server error:', error);
//   }
//   process.exit(1);
// });


const fetch = require("node-fetch");

const SERVER_URL = "http://localhost:3001/query"; // Updated port

const tests = [
  "What is the petrol price in Mumbai?",
  "How many active drivers do we have?",
  "What are the average earnings of drivers?"
];

async function runTests() {
  console.log("🚀 Starting tests...\n");

  for (let i = 0; i < tests.length; i++) {
    const query = tests[i];
    console.log(`Test ${i + 1}: "${query}"`);

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }) // 'query' key
      });

      if (!response.ok) {
        console.error("Error:", response.statusText);
        continue;
      }

      const data = await response.json();
      console.log("Answer:", data.answer, "\n");
    } catch (err) {
      console.error("Error:", err.message, "\n");
    }
  }
}

runTests();
