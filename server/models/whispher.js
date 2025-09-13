import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
// Initialize Groq client

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function whisperModel(file) {
  try {
    const translation = await groq.audio.translations.create({
      file: fs.createReadStream(file),
      model: "whisper-large-v3",
      prompt: "Specify context or spelling",
      language: "en",
      response_format: "json",
      temperature: 0.0,
    });

    console.log(translation.text);
    return translation.text;
  } catch (err) {
    console.error("Error:", err);
  }
}

whisperModel();
