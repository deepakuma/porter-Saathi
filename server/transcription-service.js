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

    // Transcribe using Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-large-v3",
      language: "en", // Force English for driver commands
      response_format: "verbose_json",
      temperature: 0.0, // More deterministic results
    });

    // Clean up uploaded file
    fs.unlink(audioPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

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
      text: transcription.text.trim(),
      confidence: Math.max(0.1, Math.min(1.0, avgConfidence)), // Clamp between 0.1 and 1.0
      duration: transcription.duration,
      language: transcription.language,
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
