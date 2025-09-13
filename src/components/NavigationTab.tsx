import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Phone,
  MessageCircle,
  Camera,
  CheckCircle,
  AlertTriangle,
  Route,
  Compass,
  Timer
} from 'lucide-react';

export function NavigationTab() {
  const [currentStep, setCurrentStep] = useState<'pickup' | 'delivery'>('pickup');
  const [isNavigating, setIsNavigating] = useState(false);

  const currentOrder = {
    id: 'ORD-2024-001',
    pickup: {
      name: 'Downtown Store',
      address: '456 Commerce St',
      contact: '+1 (555) 123-0000',
      instructions: 'Use the back entrance. Ring bell twice.'
    },
    delivery: {
      name: 'Sarah Johnson',
      address: '123 Main St, Apt 4B',
      contact: '+1 (555) 123-4567',
      instructions: 'Leave at door if no answer. Building code: 1234'
    },
    items: [
      { name: 'Electronics Package', quantity: 1, fragile: true },
      { name: 'Documents Envelope', quantity: 1, fragile: false },
      { name: 'Small Box', quantity: 1, fragile: false }
    ]
  };

  const navigationData = {
    distance: '2.3 km',
    duration: '8 minutes',
    traffic: 'Light traffic',
    route: 'Via Main St'
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    // In a real app, this would open the device's navigation app
  };

  const handleCompleteStep = () => {
    if (currentStep === 'pickup') {
      setCurrentStep('delivery');
    } else {
      // Complete delivery
      alert('Order completed successfully!');
    }
  };

  const StepCard = ({ type, data, isActive }: {
    type: 'pickup' | 'delivery';
    data: any;
    isActive: boolean;
  }) => (
    <Card className={`${isActive ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              type === 'pickup' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            {type === 'pickup' ? 'Pickup Location' : 'Delivery Location'}
          </CardTitle>
          {isActive && <Badge className="bg-orange-500 text-white">Active</Badge>}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-lg">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.address}</p>
        </div>

        {data.instructions && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Instructions:</strong> {data.instructions}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleStartNavigation}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
          
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        {isActive && (
          <Button 
            className="w-full"
            onClick={handleCompleteStep}
          >
            {type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl">Navigation</h1>
          <Badge variant="secondary" className="bg-green-500 text-white">
            {currentStep === 'pickup' ? 'Going to Pickup' : 'Going to Delivery'}
          </Badge>
        </div>
        <p className="text-primary-foreground/80 text-sm">Order: {currentOrder.id}</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Navigation Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p>{navigationData.distance}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p>{navigationData.duration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Traffic</p>
                <p>{navigationData.traffic}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p>{navigationData.route}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Destination */}
        <StepCard
          type={currentStep}
          data={currentStep === 'pickup' ? currentOrder.pickup : currentOrder.delivery}
          isActive={true}
        />

        {/* Next Destination */}
        {currentStep === 'pickup' && (
          <div>
            <h3 className="text-sm text-muted-foreground mb-3">Next Stop</h3>
            <StepCard
              type="delivery"
              data={currentOrder.delivery}
              isActive={false}
            />
          </div>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {item.fragile && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <div>
                    <p className="text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} {item.fragile && '• Fragile'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live Navigation Status */}
        {isNavigating && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm">Navigation Active</p>
                  <p className="text-xs text-muted-foreground">
                    Following route to {currentStep === 'pickup' ? 'pickup' : 'delivery'} location
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsNavigating(false)}
                >
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12">
            <Phone className="h-4 w-4 mr-2" />
            Call Customer
          </Button>
          
          <Button variant="outline" className="h-12">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          
          <Button variant="outline" className="h-12">
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
          
          <Button variant="outline" className="h-12">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
        </div>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm">Need Help?</p>
                <p className="text-xs text-muted-foreground">
                  Contact support for assistance
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-red-200">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Delivery Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm">Order accepted</p>
                <p className="text-xs text-muted-foreground">2:25 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${
                currentStep !== 'pickup' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
              }`}></div>
              <div>
                <p className="text-sm">En route to pickup</p>
                <p className="text-xs text-muted-foreground">
                  {currentStep === 'pickup' ? 'In progress...' : '2:30 PM'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${
                currentStep === 'delivery' ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'
              }`}></div>
              <div>
                <p className="text-sm">En route to delivery</p>
                <p className="text-xs text-muted-foreground">
                  {currentStep === 'delivery' ? 'In progress...' : 'Pending'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-gray-300"></div>
              <div>
                <p className="text-sm">Delivery completed</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}