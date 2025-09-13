// app.js
import express from "express";
import bodyParser from "body-parser";
import { connectMongo, embedAllCollections } from "./server/mongoService.js";
import { saveQuery } from "./server/queryService.js";
import { generateWithGroq } from "./server/groqService.js";
import { answerQuestion } from "./server/qaService.js";


const PORT = process.env.PORT || 3000;

let collection; // store Mongo collection reference

// Initialize app
const app = express();
app.use(bodyParser.json());


// ...
app.post("/qa", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const answer = await answerQuestion(query);
    res.json({ query, answer });
  } catch (err) {
    console.error("❌ QA error:", err);
    res.status(500).json({ error: err.message });
  }
});


// API endpoint
app.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // For now, save dummy vector
    const vector = [Math.random(), Math.random(), Math.random()];
    await saveQuery(collection, query, vector);

    console.log("⚡ Querying Groq:", query);
    const answer = await generateWithGroq(query);

    res.json({ query, answer });
  } catch (err) {
    console.error("❌ Error handling query:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Porter Saathi started on http://localhost:${PORT}`);

  // Connect to DB & prepare embeddings
  collection = await connectMongo();
  await embedAllCollections(collection);
});