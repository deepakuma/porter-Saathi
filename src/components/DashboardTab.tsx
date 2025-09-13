import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { 
  Clock, 
  DollarSign, 
  Package, 
  MapPin,
  TrendingUp,
  Battery,
  Wifi,
  Bell,
  Power,
  AlertTriangle
} from 'lucide-react';

interface DashboardTabProps {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  missedOrders: number;
}

export function DashboardTab({ isOnline, setIsOnline, missedOrders }: DashboardTabProps) {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            <span className="text-sm">85%</span>
            <Wifi className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm">{currentTime}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl">Good morning, John!</h1>
            <p className="text-primary-foreground/80 text-sm">
              {isOnline ? 'You are online and ready for orders!' : 'Go online to start receiving orders'}
            </p>
          </div>
          <Badge variant="secondary" className={`${
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          } text-white`}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Go Online/Offline Toggle */}
        <Card className={`border-2 ${
          isOnline ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Power className={`h-6 w-6 ${
                  isOnline ? 'text-green-500' : 'text-gray-500'
                }`} />
                <div>
                  <p>Driver Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'You are online and visible to customers' : 'Go online to start earning'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={isOnline} 
                onCheckedChange={setIsOnline}
                className="scale-125"
              />
            </div>
            
            {missedOrders > 0 && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">
                    You have missed {missedOrders} order{missedOrders > 1 ? 's' : ''} today. 
                    This may affect your acceptance rate.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                  <p className="text-2xl">$127.50</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deliveries</p>
                  <p className="text-2xl">12</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hours Online</p>
                  <p className="text-2xl">6.5h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl">4.9</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Delivery or Online Status */}
        {isOnline ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Order #ORD-2024-001</p>
                  <p className="text-sm text-muted-foreground">Pickup: Downtown Store</p>
                  <p className="text-sm text-muted-foreground">Drop: 123 Main St</p>
                </div>
                <Badge className="bg-blue-500 text-white">En Route</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <Button className="w-full">
                Navigate to Destination
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6 text-center">
              <Power className="h-12 w-12 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg mb-2">You're Offline</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Turn on your status to start receiving delivery requests and earning money.
              </p>
              <Button 
                onClick={() => setIsOnline(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                <Power className="h-4 w-4 mr-2" />
                Go Online Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12" disabled={!isOnline}>
              View Orders
            </Button>
            <Button variant="outline" className="h-12">
              Check Earnings
            </Button>
            <Button 
              variant="outline" 
              className="h-12"
              onClick={() => setIsOnline(!isOnline)}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
            <Button variant="outline" className="h-12">
              Contact Support
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm">Order #ORD-2024-001 delivered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <span className="text-sm">+$12.50</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm">New order accepted</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <span className="text-sm">Order #ORD-2024-002</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm">Earnings milestone reached</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <span className="text-sm">$100 today</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}