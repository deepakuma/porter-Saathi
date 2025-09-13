import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Zap
} from 'lucide-react';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

interface VoiceAssistantProps {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  onAcceptOrder?: () => void;
  onDeclineOrder?: () => void;
  onNavigate?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function VoiceAssistant({ 
  isOnline, 
  setIsOnline, 
  onAcceptOrder, 
  onDeclineOrder, 
  onNavigate,
  activeTab,
  setActiveTab 
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      synthesisRef.current = speechSynthesis;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        } else {
          setTranscript(interimTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const voiceCommands: VoiceCommand[] = [
    {
      command: 'go online',
      action: () => {
        setIsOnline(true);
        speak("You are now online and ready to receive orders");
      },
      description: 'Go online to receive orders'
    },
    {
      command: 'go offline',
      action: () => {
        setIsOnline(false);
        speak("You are now offline");
      },
      description: 'Go offline'
    },
    {
      command: 'accept order',
      action: () => {
        if (onAcceptOrder) {
          onAcceptOrder();
          speak("Order accepted successfully");
        } else {
          speak("No order to accept");
        }
      },
      description: 'Accept incoming order'
    },
    {
      command: 'decline order',
      action: () => {
        if (onDeclineOrder) {
          onDeclineOrder();
          speak("Order declined");
        } else {
          speak("No order to decline");
        }
      },
      description: 'Decline incoming order'
    },
    {
      command: 'navigate',
      action: () => {
        if (onNavigate) {
          onNavigate();
          speak("Starting navigation");
        } else {
          speak("No active order to navigate to");
        }
      },
      description: 'Start navigation'
    },
    {
      command: 'show dashboard',
      action: () => {
        setActiveTab('dashboard');
        speak("Showing dashboard");
      },
      description: 'Navigate to dashboard'
    },
    {
      command: 'show orders',
      action: () => {
        setActiveTab('orders');
        speak("Showing orders");
      },
      description: 'Navigate to orders'
    },
    {
      command: 'show earnings',
      action: () => {
        setActiveTab('earnings');
        speak("Showing earnings");
      },
      description: 'Navigate to earnings'
    },
    {
      command: 'show navigation',
      action: () => {
        setActiveTab('navigation');
        speak("Showing navigation");
      },
      description: 'Navigate to navigation tab'
    },
    {
      command: 'show profile',
      action: () => {
        setActiveTab('profile');
        speak("Showing profile");
      },
      description: 'Navigate to profile'
    },
    {
      command: 'help',
      action: () => {
        speak("I can help you with voice commands. Say go online, accept order, decline order, navigate, or show dashboard, orders, earnings, navigation, or profile.");
      },
      description: 'Get help with voice commands'
    },
    {
      command: 'status',
      action: () => {
        const status = isOnline ? 'online' : 'offline';
        speak(`You are currently ${status} and viewing the ${activeTab} tab`);
      },
      description: 'Check current status'
    }
  ];

  const speak = (text: string) => {
    if (synthesisRef.current && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      synthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const processVoiceCommand = (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    setLastCommand(transcript);
    
    // Find matching command
    const matchedCommand = voiceCommands.find(cmd => 
      normalizedTranscript.includes(cmd.command) ||
      cmd.command.split(' ').every(word => normalizedTranscript.includes(word))
    );
    
    if (matchedCommand) {
      matchedCommand.action();
    } else {
      speak("Sorry, I didn't understand that command. Say help for available commands.");
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 text-center">
          <MicOff className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">
            Voice commands not supported in this browser
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ${
      isListening ? 'border-green-400 bg-green-50 shadow-lg' : 
      isSpeaking ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Voice Assistant</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isListening && (
              <Badge className="bg-green-500 text-white animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
            
            {isSpeaking && (
              <Badge className="bg-blue-500 text-white animate-pulse">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
          </div>
        </div>

        {/* Voice Input Display */}
        {(transcript || lastCommand) && (
          <div className="mb-3 p-3 bg-muted rounded-lg">
            {transcript && (
              <div className="mb-2">
                <p className="text-sm text-muted-foreground">Listening:</p>
                <p className="text-sm italic">"{transcript}"</p>
                {confidence > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full transition-all"
                        style={{ width: `${confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </div>
            )}
            
            {lastCommand && !transcript && (
              <div>
                <p className="text-sm text-muted-foreground">Last command:</p>
                <p className="text-sm">"{lastCommand}"</p>
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={toggleListening}
            className={`flex-1 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
          
          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Commands */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick commands:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('go online')}
              disabled={isOnline}
            >
              <Zap className="h-3 w-3 mr-1" />
              Go Online
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('help')}
            >
              Help
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('status')}
            >
              Status
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => processVoiceCommand('show dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Try saying: "go online", "accept order", "show earnings", "navigate", or "help"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}