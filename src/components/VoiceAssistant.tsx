import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Zap,
  AlertCircle,
  Shield,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AudioRecorder, TranscriptionService } from '../utils/audioRecorder';

interface VoiceAssistantProps {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  onAcceptOrder?: () => void;
  onDeclineOrder?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasIncomingOrder: boolean;
}

export function VoiceAssistant({ 
  isOnline, 
  setIsOnline, 
  onAcceptOrder, 
  onDeclineOrder,
  activeTab,
  setActiveTab,
  hasIncomingOrder
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [audioRecordingStatus, setAudioRecordingStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('unknown' as 'unknown' | 'granted' | 'denied' | 'requesting');
  const [error, setError] = useState('');
  const [useGroqFallback, setUseGroqFallback] = useState(true);
  const [groqServiceAvailable, setGroqServiceAvailable] = useState(false);
  const [transcriptionMethod, setTranscriptionMethod] = useState('groq' as 'web-speech' | 'groq');
  
  const recognitionRef = useRef(null as any | null);
  const synthRef = useRef(null as SpeechSynthesisUtterance | null);
  const audioRecorderRef = useRef(null as AudioRecorder | null);
  const transcriptionServiceRef = useRef(null as TranscriptionService | null);
  const silenceTimerRef = useRef(null as NodeJS.Timeout | null);
  const lastSpeechTimeRef = useRef(Date.now());

  useEffect(() => {
    console.log('🎤 VoiceAssistant: Initializing services...');
    
    // Initialize services
    audioRecorderRef.current = new AudioRecorder();
    transcriptionServiceRef.current = new TranscriptionService();
    
    // Check Groq service availability with retry
    const checkGroqService = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const available = true;
          console.log(`🔍 Groq service health check result (attempt ${i + 1}):`, available);
          
          if (available) {
            setGroqServiceAvailable(true);
            setUseGroqFallback(true);
            setTranscriptionMethod('groq');
            console.log('✅ Groq transcription service is available');
            return;
          }
        } catch (error) {
          console.error(`❌ Error checking Groq service (attempt ${i + 1}):`, error);
        }
        
        // Wait before retry
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('⚠️ Groq service not available after retries, using Web Speech fallback');
      setGroqServiceAvailable(false);
      setUseGroqFallback(false);
      setTranscriptionMethod('web-speech');
    };
    
    checkGroqService();
    
    // Check if Web Speech API is supported (as fallback)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('🎙️ Web Speech API detected');
      
      // Always initialize Web Speech as fallback
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('🎤 Web Speech API: Started listening');
        setIsListening(true);
        setError('');
        setPermissionStatus('granted');
      };
      
      recognition.onend = () => {
        console.log('🛑 Web Speech API: Stopped listening');
        setIsListening(false);
        if (isListening && permissionStatus === 'granted') {
          // Restart listening if it was supposed to be on
          console.log('🔄 Web Speech API: Attempting to restart...');
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.log('❌ Recognition restart failed:', e);
            }
          }, 1000);
        }
      };
      
      recognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update last speech time when we get any speech input
        if (finalTranscript || interimTranscript) {
          lastSpeechTimeRef.current = Date.now();
          
          // Clear existing silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          
          // Start new silence timer
          silenceTimerRef.current = setTimeout(async () => {
            console.log('🔇 5 seconds of silence detected - auto-stopping...');
            await handleSilenceTimeout();
          }, 5000);
        }
        
        if (finalTranscript) {
          console.log('🎯 Web Speech API: Final result:', finalTranscript);
          console.log('🔍 Current transcriptionMethod:', transcriptionMethod);
          console.log('🔍 audioRecorderRef.current exists:', !!audioRecorderRef.current);
          console.log('🔍 groqServiceAvailable:', groqServiceAvailable);
          
          setTranscriptionText(finalTranscript);
          
          // Don't process immediately - wait for silence timeout
          console.log('⏳ Waiting for silence timeout to process with Whisper...');
          
        } else if (interimTranscript) {
          console.log('⏳ Web Speech API: Interim result:', interimTranscript);
          setTranscriptionText(interimTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Try Web Speech fallback if available and not already using it
        if (!useGroqFallback && event.error !== 'not-allowed') {
          console.log('Groq failed, switching to Web Speech fallback');
          setUseGroqFallback(false);
          setTranscriptionMethod('web-speech');
          speak('Switching to web speech recognition');
          return;
        }
        
        switch (event.error) {
          case 'not-allowed':
            setPermissionStatus('denied');
            setError('Microphone access denied. Please allow microphone permission to use voice commands.');
            break;
          case 'no-speech':
            setError('No speech detected. Please try speaking again.');
            break;
          case 'audio-capture':
            setError('Microphone not found. Please check your microphone connection.');
            break;
          case 'network':
            setError('Network error occurred. Please check your internet connection.');
            break;
          case 'service-not-allowed':
            setError('Speech recognition service is not allowed. Please try again.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}. Please try again.`);
        }
      };
      
      recognitionRef.current = recognition;
      console.log('✅ Web Speech API initialized');
    } else {
      console.log('❌ Web Speech API not supported in this browser');
    }
    
    // Final support check
    const checkFinalSupport = () => {
      const webSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      console.log('🔍 Final support check:', {
        groqServiceAvailable,
        webSpeechSupported,
        isSupported: groqServiceAvailable || webSpeechSupported
      });
      
      if (!groqServiceAvailable && !webSpeechSupported) {
        setIsSupported(false);
        console.log('❌ No transcription services available');
      }
    };
    
    // Check support after a brief delay to allow Groq service check to complete
    setTimeout(checkFinalSupport, 1000);
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const processVoiceCommand = (command: string) => {
    setIsProcessing(true);
    
    // Command patterns
    const commands = {
      // Status commands
      goOnline: ['go online', 'come online', 'start working', 'start shift'],
      goOffline: ['go offline', 'stop working', 'end shift', 'take a break'],
      
      // Order commands
      acceptOrder: ['accept order', 'accept', 'take order', 'yes accept'],
      declineOrder: ['decline order', 'decline', 'reject order', 'no thanks'],
      
      // Navigation commands
      navigate: ['navigate', 'start navigation', 'give directions', 'show route'],
      
      // Tab navigation
      dashboard: ['go to dashboard', 'show dashboard', 'home screen'],
      orders: ['show orders', 'view orders', 'order list'],
      earnings: ['show earnings', 'check earnings', 'money earned'],
      navigation: ['navigation tab', 'show navigation', 'map view'],
      profile: ['show profile', 'user profile', 'my profile'],
      
      // Status queries
      checkStatus: ['what is my status', 'am i online', 'check status'],
      checkEarnings: ['how much did i earn', 'total earnings', 'money made'],
    };

    let commandExecuted = false;

    // Check status commands
    if (commands.goOnline.some(cmd => command.includes(cmd))) {
      if (!isOnline) {
        setIsOnline(true);
        speak('You are now online and ready to receive orders');
      } else {
        speak('You are already online');
      }
      commandExecuted = true;
    }
    
    else if (commands.goOffline.some(cmd => command.includes(cmd))) {
      if (isOnline) {
        setIsOnline(false);
        speak('You are now offline. You will not receive new orders');
      } else {
        speak('You are already offline');
      }
      commandExecuted = true;
    }
    
    // Order commands
    else if (commands.acceptOrder.some(cmd => command.includes(cmd))) {
      if (hasIncomingOrder && onAcceptOrder) {
        onAcceptOrder();
        speak('Order accepted successfully');
      } else {
        speak('No order to accept');
      }
      commandExecuted = true;
    }
    
    else if (commands.declineOrder.some(cmd => command.includes(cmd))) {
      if (hasIncomingOrder && onDeclineOrder) {
        onDeclineOrder();
        speak('Order declined');
      } else {
        speak('No order to decline');
      }
      commandExecuted = true;
    }
    
    // Tab navigation
    else if (commands.dashboard.some(cmd => command.includes(cmd))) {
      setActiveTab('dashboard');
      speak('Showing dashboard');
      commandExecuted = true;
    }
    
    else if (commands.orders.some(cmd => command.includes(cmd))) {
      setActiveTab('orders');
      speak('Showing orders');
      commandExecuted = true;
    }
    
    else if (commands.earnings.some(cmd => command.includes(cmd))) {
      setActiveTab('earnings');
      speak('Showing earnings');
      commandExecuted = true;
    }
    
    else if (commands.navigation.some(cmd => command.includes(cmd))) {
      setActiveTab('navigation');
      speak('Showing navigation');
      commandExecuted = true;
    }
    
    else if (commands.profile.some(cmd => command.includes(cmd))) {
      setActiveTab('profile');
      speak('Showing profile');
      commandExecuted = true;
    }
    
    // Status queries
    else if (commands.checkStatus.some(cmd => command.includes(cmd))) {
      speak(`You are currently ${isOnline ? 'online and ready for orders' : 'offline'}`);
      commandExecuted = true;
    }
    
    if (!commandExecuted) {
      speak('Sorry, I did not understand that command. Try saying go online, accept order, or show dashboard');
    }
    
    setTimeout(() => setIsProcessing(false), 1000);
  };

  const requestMicrophonePermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Microphone access is not supported in this browser.');
      return false;
    }

    setPermissionStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we only needed permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      setError('');
      return true;
    } catch (err: any) {
      setPermissionStatus('denied');
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please click the microphone icon in your browser\'s address bar and allow access.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please check your microphone connection.');
      } else {
        setError('Failed to access microphone. Please check your settings.');
      }
      return false;
    }
  };

  const toggleListening = async () => {
    console.log('🎤 Toggle listening clicked', {
      isSupported,
      isListening,
      useGroqFallback,
      groqServiceAvailable,
      hasRecognition: !!recognitionRef.current,
      hasAudioRecorder: !!audioRecorderRef.current
    });
    
    if (!isSupported) {
      console.log('❌ Voice assistant not supported');
      return;
    }

    if (isListening) {
      await stopListening();
      return;
    }

    // Check and request permission if needed
    if (permissionStatus !== 'granted') {
      console.log('🔐 Requesting microphone permission...');
      const granted = await requestMicrophonePermission();
      if (!granted) {
        console.log('❌ Microphone permission denied');
        return;
      }
    }

    setError('');

    // Use hybrid approach: Web Speech + Groq Whisper
    if (groqServiceAvailable) {
      console.log('🔄 Starting hybrid Web Speech + Groq Whisper...');
      await startHybridRecording();
    } else if (recognitionRef.current) {
      console.log('🎤 Fallback to Web Speech only...');
      await startWebSpeechRecognition();
    } else {
      console.log('❌ No transcription service available');
      setError('No transcription service available. Please check your setup.');
    }
  };

  const startWebSpeechRecognition = async () => {
    if (!recognitionRef.current) return;
    
    // Check if recognition is already running
    if (recognitionRef.current.state === 'listening') {
      console.log('⚠️ Recognition already running, stopping first');
      recognitionRef.current.stop();
      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      console.error('Failed to start recognition:', e);
      if (e.name === 'InvalidStateError') {
        setError('Speech recognition is already running. Please try again.');
      } else {
        setError('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const handleSilenceTimeout = async () => {
    console.log('🔇 Handling silence timeout - processing with Whisper...');
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Stop listening and process with Groq Whisper
    if (audioRecorderRef.current && transcriptionServiceRef.current) {
      try {
        const isGroqAvailable = true;
        console.log('🔍 Groq availability for silence processing:', isGroqAvailable);
        
        if (isGroqAvailable) {
          console.log('🔄 Processing silence-triggered Whisper transcription...');
          setAudioRecordingStatus('Processing with Groq Whisper...');
          
          const audioBlob = await audioRecorderRef.current.stopRecording();
          console.log('📁 Silence-triggered audio blob:', !!audioBlob, audioBlob?.size || 0, 'bytes');
          
          if (audioBlob) {
            await processGroqTranscription(audioBlob);
          } else {
            console.log('❌ No audio blob from silence timeout');
          }
        } else {
          console.log('❌ Groq not available during silence timeout');
        }
      } catch (error) {
        console.error('❌ Error processing silence timeout:', error);
      }
    }
    
    // Stop Web Speech API
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Web Speech API stopped after silence');
      } catch (error) {
        console.error('❌ Error stopping Web Speech API after silence:', error);
      }
    }
    
    setIsListening(false);
  };

  const stopListening = async () => {
    console.log('🛑 Stopping voice recognition...');
    setIsListening(false);
    setError('');
    
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('✅ Web Speech API stopped');
      } catch (error) {
        console.error('❌ Error stopping Web Speech API:', error);
      }
    }
    
    // In hybrid mode, audio recording is handled by Web Speech onresult
    // For pure Groq mode, process the audio blob
    if (audioRecorderRef.current && transcriptionMethod === 'groq') {
      try {
        const audioBlob = await audioRecorderRef.current.stopRecording();
        if (audioBlob) {
          console.log('🔄 Processing recorded audio with Groq...');
          await processGroqTranscription(audioBlob);
        }
      } catch (error) {
        console.error('❌ Error stopping audio recording:', error);
      }
    }
    
    setAudioRecordingStatus('');
    setTranscriptionMethod('webspeech'); // Reset to default
  };

  const startHybridRecording = async () => {
    if (!audioRecorderRef.current || !recognitionRef.current) {
      console.error('❌ AudioRecorder or SpeechRecognition not initialized');
      return;
    }
    
    try {
      console.log('🎙️ Starting hybrid Web Speech + Groq recording...');
      setAudioRecordingStatus('Listening with Web Speech API...');
      setTranscriptionText('');
      
      // Start both Web Speech API and audio recording simultaneously
      await Promise.all([
        audioRecorderRef.current.startRecording(),
        startWebSpeechRecognition()
      ]);
      
      setIsListening(true);
      setTranscriptionMethod('hybrid');
      console.log('✅ Hybrid recording started successfully');
    } catch (error) {
      console.error('❌ Failed to start hybrid recording:', error);
      setError('Failed to start hybrid recording');
      setAudioRecordingStatus('');
    }
  };

  const processGroqTranscription = async (audioBlob: Blob) => {
    console.log('🔄 Processing Groq transcription directly...', {
      audioBlobSize: audioBlob.size,
      audioBlobType: audioBlob.type
    });
    
    setIsProcessing(true);
    setAudioRecordingStatus(`Processing audio (${(audioBlob.size / 1024).toFixed(1)}KB)...`);
    
    try {
      // Save audio blob to file and process with whisperModel directly
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('http://localhost:3001/process-audio-direct', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('🎯 Direct Whisper result:', result);
      
      // Display the transcription text
      setTranscriptionText(result.text);
      setLastCommand(result.text.toLowerCase().trim());
      setConfidence(result.confidence);
      
      setAudioRecordingStatus(`Transcription complete (${Math.round(result.confidence * 100)}% confidence)`);
      
      // Show transcription result to user
      speak(`I heard: ${result.text}`);
      
      if (result.confidence > 0.5) {
        console.log('✅ Processing Whisper command:', result.text);
        setTimeout(() => {
          processVoiceCommand(result.text.toLowerCase().trim());
        }, 2000); // Give user time to see the transcription
      } else {
        console.log('⚠️ Low confidence, asking user to repeat');
        setTimeout(() => {
          speak('Could not understand the command clearly. Please try again.');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Direct Whisper transcription error:', error);
      setAudioRecordingStatus('Transcription failed');
      
      // Try Web Speech as fallback if Groq fails
      if (recognitionRef.current && useGroqFallback) {
        console.log('🔄 Groq failed, trying Web Speech fallback');
        setUseGroqFallback(false);
        setTranscriptionMethod('web-speech');
        speak('Switching to web speech recognition');
        setTimeout(() => startWebSpeechRecognition(), 1000);
      } else {
        setError(`Transcription failed: ${error.message || error}`);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setAudioRecordingStatus('');
      }, 3000);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      speak('Voice feedback enabled');
    }
  };

  const toggleTranscriptionMethod = () => {
    // Can only toggle if both services are available
    if (!groqServiceAvailable || !recognitionRef.current) return;
    
    const newMethod = useGroqFallback ? 'web-speech' : 'groq';
    setUseGroqFallback(!useGroqFallback);
    setTranscriptionMethod(newMethod);
    
    const methodName = newMethod === 'groq' ? 'enhanced Groq transcription' : 'web speech recognition';
    speak(`Switched to ${methodName}`);
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Card className="w-64 border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Voice Assistant</span>
            </div>
            <div className="text-xs text-orange-700">
              <p>Voice commands are not available.</p>
              <p className="mt-1">{groqServiceAvailable ? 'Groq transcription service is running but there may be a configuration issue.' : 'Please ensure the Groq transcription service is running and try using Chrome, Safari, or Edge for Web Speech fallback.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-20 right-4 z-40">
        {permissionStatus === 'denied' ? (
          <div className="space-y-2">
            <Button
              onClick={requestMicrophonePermission}
              className="h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600"
            >
              <Shield className="h-6 w-6" />
            </Button>
            <Card className="w-48 border-orange-200 bg-orange-50">
              <CardContent className="p-2">
                <div className="text-xs text-orange-700">
                  <p>Click to enable microphone access</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Button
            onClick={toggleListening}
            disabled={permissionStatus === 'requesting'}
            className={`h-14 w-14 rounded-full shadow-lg ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : permissionStatus === 'requesting'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } ${isProcessing ? 'animate-spin' : ''}`}
          >
            {permissionStatus === 'requesting' ? (
              <RotateCcw className="h-6 w-6 animate-spin" />
            ) : isListening ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>
        )}
      </div>

      {/* Voice Status Card */}
      {(isListening || lastCommand || error) && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <Card className={`${error ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {error ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm">Voice Assistant</span>
                  {isListening && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      Listening...
                    </Badge>
                  )}
                  {isProcessing && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing...
                    </Badge>
                  )}
                  {permissionStatus === 'requesting' && (
                    <Badge className="bg-orange-500 text-white">
                      Requesting Permission...
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {(groqServiceAvailable && recognitionRef.current) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTranscriptionMethod}
                      className="h-8 w-8 p-0"
                      title={`Switch to ${useGroqFallback ? 'Web Speech' : 'Groq Transcription'}`}
                    >
                      {useGroqFallback ? (
                        <Wifi className="h-4 w-4 text-green-600" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-blue-600" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoice}
                    className="h-8 w-8 p-0"
                  >
                    {voiceEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {error && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setError('')}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="text-sm space-y-2">
                  <p className="text-red-700">{error}</p>
                  {permissionStatus === 'denied' && (
                    <div className="bg-red-100 border border-red-200 p-2 rounded">
                      <p className="text-xs text-red-600">
                        <strong>How to enable microphone:</strong><br />
                        1. Click the microphone icon in your browser's address bar<br />
                        2. Select "Allow" for microphone access<br />
                        3. Refresh the page if needed
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {audioRecordingStatus && (
                <div className="text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-blue-700 font-medium">{audioRecordingStatus}</p>
                  </div>
                </div>
              )}
              
              {transcriptionText && (
                <div className="text-sm mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-muted-foreground">Transcription:</p>
                    <Badge variant="outline" className="text-xs">
                      Whisper AI
                    </Badge>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-2 rounded">
                    <p className="text-green-800 font-medium">"{transcriptionText}"</p>
                    {confidence > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Confidence: {Math.round(confidence * 100)}%
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    🌍 Supports any language - automatically translated to English
                  </p>
                </div>
              )}
              
              {!error && lastCommand && !transcriptionText && (
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Last command:</p>
                    <Badge variant="outline" className="text-xs">
                      {transcriptionMethod === 'groq' ? 'Groq' : 'Web Speech'}
                    </Badge>
                  </div>
                  <p className="text-blue-700">"{lastCommand}"</p>
                  {confidence > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              )}
              
              {!error && isListening && !lastCommand && !audioRecordingStatus && (
                <div className="text-sm text-muted-foreground">
                  <p>{useGroqFallback ? '🎙️ Recording audio for Whisper...' : '🎤 Listening...'} Say commands like:</p>
                  <p>"Go online", "Accept order", "Show dashboard"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Voice Commands Help */}
      {isListening && (
        <div className="fixed bottom-36 right-4 z-40">
          <Card className="w-64 border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm">Quick Commands</span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <p>• "Go online/offline"</p>
                <p>• "Accept/decline order"</p>
                <p>• "Show dashboard/orders"</p>
                <p>• "Start navigation"</p>
                <p>• "Check earnings"</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}