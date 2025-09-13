# Porter Saathi - Driver Partner App

This is a Porter Driver Partner App with integrated Voice Assistant powered by Groq Whisper AI for hands-free operation.

## Features

- 🎙️ **Voice Assistant**: Control the app using voice commands
- 🤖 **Groq Whisper Integration**: High-accuracy speech-to-text transcription
- 📱 **Driver Dashboard**: Complete driver interface for order management
- 🔊 **Voice Feedback**: Audio responses for better accessibility
- 🚗 **Real-time Navigation**: Voice-controlled navigation assistance

## Voice Commands

- "Go online" / "Go offline" - Toggle driver availability
- "Accept order" / "Decline order" - Handle incoming orders
- "Show dashboard" / "Show orders" / "Show earnings" - Navigate between tabs
- "Navigate to pickup" / "Navigate to drop" - Start navigation

## Setup Instructions

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Transcription Service
```bash
cd server
npm install
# Copy .env.example to .env and add your Groq API key
npm start
```

## Voice Assistant Setup

1. **Get Groq API Key**: Sign up at [Groq Console](https://console.groq.com/)
2. **Configure Environment**: Copy `server/.env.example` to `server/.env` and add your API key
3. **Start Services**: Run both frontend and backend servers
4. **Enable Microphone**: Allow microphone access in your browser

For detailed setup instructions, see [VOICE_ASSISTANT_SETUP.md](VOICE_ASSISTANT_SETUP.md)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Voice AI**: Groq Whisper API
- **UI Components**: Tailwind CSS + shadcn/ui
