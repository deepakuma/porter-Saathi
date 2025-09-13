import OpenAI from "openai";
import { pipeline } from "@xenova/transformers";
import { MongoClient } from "mongodb";

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: OPENROUTER_BASE_URL });
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Please set MONGO_URI in .env file");
  process.exit(1);
}

const client = new MongoClient(MONGO_URI);

export async function answerQuestion(query) {
  await client.connect();
  const db = client.db("deliveryDB");
  const collections = ["dailystats","users", "cancellationcharges", "petrolprices"];


  // 1. Embed query
  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const qVec = await embedder(query);
  const queryEmbedding = Array.from(qVec.data);

  // 2. Fetch docs
//   const docs = await collection.find({ embedding: { $exists: true } }).toArray();
  let docs = [];
  for (const colName of collections) {
    const col = db.collection(colName);
    
    const doc = await col.find({ embedding: { $exists: true } }).toArray();
    // Attach collection name to doc (optional, useful for context)
    doc.forEach(d => d._collection = colName);
    docs.push(...doc);
    console.log(`Fetched ${doc.length} docs from ${colName}`);
    // const docs = await col.find({}).toArray(); // fetch all docs

  console.log(`Processing ${docs.length} docs from ${colName}`);

//   for (const doc of docs) {
//         // Dynamically pick all string fields for embedding
//         const text = Object.entries(doc)
//           .filter(([key, value]) => typeof value === "string" && key !== "_id")
//           .map(([key, value]) => {
//                 if (typeof value === "string") return `${key}: ${value}`;
//                 if (typeof value === "object" && value !== null) return `${key}: ${JSON.stringify(value)}`;
//                 return null;
//                 })
//             .filter(Boolean)
//             .join("\n");

//     console.log(`Embedding text for doc ${doc._id}: ${text}`);

//     if (!text) continue;

//     const vector = await embedder(text);
//     const embedding = Array.from(vector.data);

//     await col.updateOne({ _id: doc._id }, { $set: { embedding } });
//   }
  }

  // 3. Cosine similarity
  function cosineSim(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  }

  // 4. Build dynamic context from all fields except _id and embedding
  function buildText(doc) {
    const exclude = ["_id", "embedding"];
    return Object.entries(doc)
      .filter(([key, val]) => !exclude.includes(key) && val != null)
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");
  }

  const ranked = docs
    .map(d => ({
      text: buildText(d),
      score: cosineSim(queryEmbedding, d.embedding),
    }))
    .filter(r => r.text.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const context = ranked.map(r => r.text).join("\n") || "No relevant data found.";

  // 5. Query LLM via OpenRouter
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant answering from company data." },
      { role: "user", content: `Answer based on the following context:\n${context}\n\nQuestion: ${query}` }
    ]
  });

  const answer = completion.choices[0].message.content;
  console.log("LLM Response:", answer);

  return answer;
}
