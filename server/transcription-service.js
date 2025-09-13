import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { whisperModel } from './models/whispher.js';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

import { connectDB, createUserAndStats } from './db.js';

async function start() {
  await connectDB();
  await createUserAndStats();

  app.listen(port, () => {
    console.log(`Transcription service running on port ${port}`);
    console.log(`GROQ_API_KEY configured: ${!!process.env.GROQ_API_KEY}`);
  });
}

start();

// Groq client no longer needed - using whisperModel function directly

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 Received file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    // Accept audio files and be more permissive
    if (file.mimetype.startsWith('audio/') || 
        file.originalname.match(/\.(wav|webm|mp4|mp3|ogg|opus|m4a|flac)$/i)) {
      console.log('✅ File accepted');
      cb(null, true);
    } else {
      console.log('❌ File rejected - not audio format');
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3002',  // Porter Driver App
    'http://localhost:5173',  // Vite default
    'http://localhost:3000',  // React/Next.js
    'http://localhost:8080',  // Vue/other
    'http://127.0.0.1:3002',  // Porter Driver App (IP)
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'transcription-service' });
});

// Direct audio processing endpoint (bypasses old transcribe API)
app.post('/process-audio-direct', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided' 
      });
    }

    const audioPath = req.file.path;
    
    console.log(`🎵 Processing audio file directly: ${audioPath}`);
    console.log(`📊 File size: ${req.file.size} bytes`);
    console.log(`🎧 File type: ${req.file.mimetype}`);

    // Call whisperModel function directly - no API calls
    console.log('🔄 Calling whisperModel function directly...');
    const translatedText = await whisperModel(audioPath);

    // Clean up uploaded file
    fs.unlink(audioPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    console.log('\n🎯 === DIRECT WHISPER RESPONSE ===');
    console.log(`📝 Translated text: "${translatedText}"`);
    console.log('==================================\n');

    const response = {
      text: translatedText ? translatedText.trim() : '',
      confidence: 0.85,
      language: "en",
      model: "whisper-large-v3"
    };

    console.log('\n📤 === RESPONSE TO FRONTEND ===');
    console.log('📄 Response:', JSON.stringify(response, null, 2));
    console.log('===============================\n');
    res.json(response);

  } catch (error) {
    console.error('❌ Direct processing error:', error);
    
    res.status(500).json({ 
      error: 'Direct processing failed',
      details: error.message
    });
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

// Server is started in the start() function above

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
