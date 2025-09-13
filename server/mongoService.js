import { MongoClient } from "mongodb";
import { pipeline } from "@xenova/transformers";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Please set MONGO_URI in .env file");
  process.exit(1);
}

const client = new MongoClient(MONGO_URI);

export async function connectMongo() {
  await client.connect();
  const db = client.db("deliveryDB");
  console.log("✅ Connected to MongoDB");
  return db;
}

export async function embedAllCollections() {
  const db = await connectMongo();

  // Get all collections in the database
  const collections = await db.listCollections().toArray();
  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  for (const colInfo of collections) {
    const colName = colInfo.name;
    const collection = db.collection(colName);

    const data = await collection.find({}).toArray();
    console.log(`Processing ${data.length} documents from collection: ${colName}`);

    for (const item of data) {
      // Dynamically pick all string fields for embedding
      const text = Object.entries(item)
        .filter(([key, val]) => typeof val === "string" && key !== "_id")
        .map(([key, val]) => `${key}: ${val}`)
        .join("\n");

      if (!text) {
        console.warn(`Skipping ${item._id} - no valid text to embed`);
        continue;
      }

      const vector = await embedder(text);
      const embedding = Array.from(vector.data);

      await collection.updateOne({ _id: item._id }, { $set: { embedding } });
    }
    console.log(`✅ Completed embeddings for collection: ${colName}`);
  }

  console.log("✅ All collections updated with embeddings!");
}