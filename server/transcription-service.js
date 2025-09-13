import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Groq client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'transcription-service' });
});

// Transcription endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided' 
      });
    }

    const audioPath = req.file.path;
    
    console.log(`Processing audio file: ${audioPath}`);
    console.log(`File size: ${req.file.size} bytes`);
    console.log(`File type: ${req.file.mimetype}`);

    // Transcribe using Groq Whisper with auto-language detection
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3",
      // Auto-detect language - Whisper will identify the spoken language
      response_format: "verbose_json",
      temperature: 0.0, // More deterministic results
    });

    // Clean up uploaded file
    fs.unlink(audioPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    console.log(`Detected language: ${transcription.language || 'unknown'}`);
    console.log(`Original transcription: ${transcription.text}`);

    let finalText = transcription.text;
    let translatedFromLanguage = transcription.language;

    // If the detected language is not English, translate to English
    if (transcription.language && transcription.language !== 'en' && transcription.language !== 'english') {
      try {
        console.log(`Translating from ${transcription.language} to English...`);
        
        const translation = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a professional translator. Translate the given text to English. Only return the translated text, nothing else. If the text is already in English, return it as is."
            },
            {
              role: "user",
              content: `Translate this to English: "${transcription.text}"`
            }
          ],
          model: "llama3-8b-8192",
          temperature: 0.1,
          max_tokens: 150
        });

        finalText = translation.choices[0]?.message?.content?.trim() || transcription.text;
        console.log(`Translated text: ${finalText}`);
      } catch (translationError) {
        console.error('Translation failed, using original text:', translationError);
        // Fall back to original text if translation fails
        finalText = transcription.text;
      }
    }

    // Extract confidence from segments if available
    let avgConfidence = 0;
    if (transcription.segments && transcription.segments.length > 0) {
      const totalConfidence = transcription.segments.reduce((sum, segment) => {
        return sum + (segment.avg_logprob || 0);
      }, 0);
      // Convert log probability to confidence (approximate)
      avgConfidence = Math.exp(totalConfidence / transcription.segments.length);
    }

    const response = {
      text: finalText.trim(), // Use translated text if available
      originalText: transcription.text.trim(), // Keep original for reference
      confidence: Math.max(0.1, Math.min(1.0, avgConfidence)), // Clamp between 0.1 and 1.0
      duration: transcription.duration,
      language: transcription.language,
      translatedFromLanguage: translatedFromLanguage,
      wasTranslated: finalText !== transcription.text,
      segments: transcription.segments?.length || 0,
      model: "whisper-large-v3"
    };

    console.log('Transcription result:', response);
    res.json(response);

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Clean up file on error
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temp file on error:', err);
      });
    }

    // Handle specific Groq API errors
    if (error.status === 400) {
      res.status(400).json({ 
        error: 'Invalid audio file or request',
        details: error.message 
      });
    } else if (error.status === 401) {
      res.status(500).json({ 
        error: 'Authentication failed - check GROQ_API_KEY' 
      });
    } else if (error.status === 429) {
      res.status(429).json({ 
        error: 'Rate limit exceeded - please try again later' 
      });
    } else {
      res.status(500).json({ 
        error: 'Transcription failed',
        details: error.message 
      });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large - maximum size is 25MB' 
      });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(port, () => {
  console.log(`Transcription service running on port ${port}`);
  console.log(`GROQ_API_KEY configured: ${!!process.env.GROQ_API_KEY}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
