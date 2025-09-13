import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Zap
} from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (isListening) {
          // Restart listening if it was supposed to be on
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              console.log('Recognition restart failed:', e);
            }
          }, 1000);
        }
      };
      
      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        const confidence = event.results[last][0].confidence;
        
        setLastCommand(command);
        setConfidence(confidence);
        
        if (event.results[last].isFinal && confidence > 0.7) {
          processVoiceCommand(command);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
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

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      speak('Voice feedback enabled');
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={toggleListening}
          className={`h-14 w-14 rounded-full shadow-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          } ${isProcessing ? 'animate-spin' : ''}`}
        >
          {isListening ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Voice Status Card */}
      {(isListening || lastCommand) && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
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
                </div>
                
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
              </div>
              
              {lastCommand && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Last command:</p>
                  <p className="text-blue-700">"{lastCommand}"</p>
                  {confidence > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Confidence: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              )}
              
              {isListening && !lastCommand && (
                <div className="text-sm text-muted-foreground">
                  <p>🎤 Say commands like:</p>
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