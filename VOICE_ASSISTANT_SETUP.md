# Voice Assistant with Groq Integration Setup

This guide explains how to set up the enhanced voice assistant that uses both Web Speech API and Groq's Whisper transcription as a fallback for better accuracy.

## Features

- **Dual Transcription Methods**: Web Speech API for real-time recognition, Groq Whisper for enhanced accuracy
- **Automatic Fallback**: Switches to Groq transcription when Web Speech API fails
- **Manual Toggle**: Users can manually switch between transcription methods
- **Enhanced Error Handling**: Better error messages and recovery options
- **Voice Commands**: Same commands as before but with improved recognition

## Setup Instructions

### 1. Backend Service Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 2. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 3. Start the Services

Start the transcription service:
```bash
cd server
npm start
```

Start the main app (in a new terminal):
```bash
cd ..
npm run dev
```

## How It Works

### Web Speech API (Default)
- Real-time speech recognition
- Works offline in supported browsers
- Lower latency
- May have accuracy issues with accents or noise

### Groq Whisper Transcription (Fallback)
- Uses OpenAI's Whisper model via Groq
- Higher accuracy, especially with accents
- Works with noisy environments
- Requires internet connection
- Slightly higher latency (records audio, then transcribes)

### Automatic Switching
The system automatically switches to Groq transcription when:
- Web Speech API encounters network errors
- Service becomes unavailable
- Audio capture issues occur

### Manual Toggle
Users can manually switch between methods using the WiFi icon in the voice status card.

## Voice Commands

All existing voice commands work with both transcription methods:

**Status Control:**
- "Go online" / "Come online" / "Start working"
- "Go offline" / "Stop working" / "End shift"

**Order Management:**
- "Accept order" / "Accept" / "Take order"
- "Decline order" / "Decline" / "Reject order"

**Navigation:**
- "Go to dashboard" / "Show dashboard"
- "Show orders" / "View orders"
- "Show earnings" / "Check earnings"
- "Show navigation" / "Navigation tab"
- "Show profile" / "User profile"

**Status Queries:**
- "What is my status" / "Am I online"
- "How much did I earn" / "Total earnings"

## Troubleshooting

### Groq Service Not Available
- Check your internet connection
- Verify GROQ_API_KEY in server/.env
- Ensure the transcription service is running on port 3001
- Check server logs for API errors

### Microphone Permission Issues
- Click the microphone icon in browser address bar
- Select "Allow" for microphone access
- Refresh the page if needed
- Try the shield icon if permission was denied

### Audio Quality Issues
- Use Groq transcription for better accuracy in noisy environments
- Ensure microphone is working properly
- Speak clearly and at normal volume
- Try different browsers (Chrome, Safari, Edge work best)

### Network Errors
- Web Speech API requires internet for some browsers
- Groq transcription always requires internet
- Check firewall settings for port 3001

## API Endpoints

The transcription service exposes:

- `POST /transcribe` - Upload audio file for transcription
- `GET /health` - Check service health

## File Structure

```
server/
├── transcription-service.js  # Main service
├── package.json             # Dependencies
├── .env.example            # Environment template
└── uploads/                # Temporary audio files (auto-created)

src/
├── components/
│   └── VoiceAssistant.tsx  # Enhanced component
└── utils/
    └── audioRecorder.ts    # Audio recording utilities
```

## Security Notes

- API keys are stored in environment variables
- Temporary audio files are automatically deleted
- CORS is configured for frontend origin only
- File upload limits are enforced (25MB max)
