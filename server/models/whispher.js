import fs from "fs";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
// Initialize Groq client

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function whisperModel(file) {
  console.log("🔍 whisperModel called with file:", file);
  if (!file) {
    console.error("Error: No file path provided");
    console.log("Usage: node models/whispher.js <path-to-audio-file>");
    return;
  }

  if (!fs.existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    return;
  }
  console.log("🔍 File exists, proceeding with Groq API call...");
  try {
    console.log(`Processing audio file: ${file}`);
    const translation = await groq.audio.translations.create({
      file: fs.createReadStream(file),
      model: "whisper-large-v3",
      prompt: "Specify context or spelling",
      language: "en",
      response_format: "json",
      temperature: 0.0,
    });

    console.log("Translation result:", translation.text);
    return translation.text;
  } catch (err) {
    console.error("❌ Whisper API Error:", err);
    console.error("❌ Full error details:", JSON.stringify(err, null, 2));
    throw err; // Re-throw the error so it can be handled by the caller
  }
}

// Export the function for use in other modules
export { whisperModel };

// Command line usage (only when run directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  const audioFilePath = process.argv[2];

  if (audioFilePath) {
    whisperModel(audioFilePath);
  } else {
    console.log("Usage: node models/whispher.js <path-to-audio-file>");
    console.log("Example: node models/whispher.js ../uploads/recording.wav");
  }
}

// Example usage:
// whisperModel('./path/to/audio/file.wav');
