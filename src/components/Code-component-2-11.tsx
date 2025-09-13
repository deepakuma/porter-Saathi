import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  MapPin, 
  DollarSign, 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Navigation
} from 'lucide-react';

interface Order {
  id: string;
  pickup: {
    name: string;
    address: string;
  };
  delivery: {
    name: string;
    address: string;
  };
  payment: number;
  distance: string;
  items: number;
}

interface OrderAlertProps {
  order: Order;
  onAccept: () => void;
  onDecline: () => void;
  onTimeout: () => void;
}

export function OrderAlert({ order, onAccept, onDecline, onTimeout }: OrderAlertProps) {
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds to accept
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        
        // Show warning when 5 seconds left
        if (prev <= 5) {
          setShowWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const progressPercentage = (timeLeft / 15) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
        {/* Urgent Header */}
        <div className={`p-4 rounded-t-lg text-white text-center ${
          showWarning ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5" />
            <span>New Order Available!</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{timeLeft}s</span>
              {showWarning && <AlertTriangle className="h-5 w-5 animate-bounce" />}
            </div>
            
            <Progress 
              value={progressPercentage} 
              className={`h-2 ${showWarning ? 'animate-pulse' : ''}`}
            />
            
            {showWarning && (
              <p className="text-sm animate-pulse">
                ⚠️ Accept now or face cancellation charges!
              </p>
            )}
          </div>
        </div>

        <Card className="rounded-t-none shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{order.id}</CardTitle>
              <Badge className="bg-orange-500 text-white animate-pulse">
                URGENT
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Pickup Location */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup from</p>
                <p>{order.pickup.name}</p>
                <p className="text-sm text-muted-foreground">{order.pickup.address}</p>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Deliver to</p>
                <p>{order.delivery.name}</p>
                <p className="text-sm text-muted-foreground">{order.delivery.address}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-lg">${order.payment}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{order.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{order.items} items</span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            {showWarning && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">
                    <strong>Warning:</strong> Missing this order may result in cancellation charges and affect your acceptance rate.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={onDecline}
                className="h-12 border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              
              <Button 
                onClick={onAccept}
                className={`h-12 ${
                  showWarning 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Order
              </Button>
            </div>

            {/* Quick View Map Button */}
            <Button variant="ghost" className="w-full text-sm">
              <Navigation className="h-4 w-4 mr-2" />
              Quick View Route
            </Button>
          </CardContent>
        </Card>

        {/* Bottom Warning */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-b-lg text-center">
          <p className="text-sm text-yellow-700">
            💡 <strong>Tip:</strong> Higher acceptance rate = More orders & better earnings!
          </p>
        </div>
      </div>
    </div>
  );
}