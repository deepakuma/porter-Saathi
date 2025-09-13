// app.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// OpenAI v4+
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Example LLM function
async function handleQuery(query) {
  const contextPrompt = `
    Available petrol prices: ${JSON.stringify(petrolData)}
    Delivery partners data: ${JSON.stringify(deliveryData)}
    Based on this data, please answer: ${query}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Porter Saathi, helping delivery partners with petrol prices, earnings, orders, etc." },
        { role: "user", content: contextPrompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return completion.choices[0].message.content;

  } catch (err) {
    console.error("LLM Error:", err);
    throw new Error("Failed to process query with LLM");
  }
}

// Dummy data for testing
let deliveryData = [{ phoneNumber: "1234567890", location: "Mumbai", isActive: true, rating: 4.5, earnings: 5000, deliveries: 50 }];
let petrolData = [{ location: "Mumbai", price: 108 }];

// /query endpoint
app.post("/query", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text in request body" });
  try {
    const answer = await handleQuery(text);
    res.json({ query: text, answer });
  } catch (err) {
    res.status(500).json({ error: "Failed to process query", message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, "127.0.0.1", () => console.log(`Server running at http://127.0.0.1:${PORT}`));
