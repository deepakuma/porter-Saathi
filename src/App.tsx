import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DashboardTab } from './components/DashboardTab';
import { OrdersTab } from './components/OrdersTab';
import { EarningsTab } from './components/EarningsTab';
import { ProfileTab } from './components/ProfileTab';
import { NavigationTab } from './components/NavigationTab';
import { OrderAlert } from './components/OrderAlert';
import { VoiceAssistant } from './components/VoiceAssistant';
import { 
  Home, 
  Package, 
  DollarSign, 
  User, 
  Navigation
} from 'lucide-react';

interface IncomingOrder {
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<IncomingOrder | null>(null);
  const [missedOrders, setMissedOrders] = useState(0);

  // Simulate incoming orders when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      // Random chance of getting an order (20% every 10 seconds when online)
      if (Math.random() < 0.2 && !incomingOrder) {
        const newOrder: IncomingOrder = {
          id: `ORD-${Date.now()}`,
          pickup: {
            name: 'Downtown Store',
            address: '456 Commerce St'
          },
          delivery: {
            name: 'Customer',
            address: '123 Main St, Apt 4B'
          },
          payment: Math.floor(Math.random() * 20) + 10,
          distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
          items: Math.floor(Math.random() * 5) + 1
        };
        setIncomingOrder(newOrder);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isOnline, incomingOrder]);

  const handleAcceptOrder = () => {
    setIncomingOrder(null);
    // In real app, this would add to accepted orders
  };

  const handleDeclineOrder = () => {
    setIncomingOrder(null);
    // In real app, this might affect driver rating
  };

  const handleOrderTimeout = () => {
    setMissedOrders(prev => prev + 1);
    setIncomingOrder(null);
    // In real app, this could trigger cancellation charges
  };

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="dashboard" className="m-0 h-full">
            <DashboardTab 
              isOnline={isOnline} 
              setIsOnline={setIsOnline}
              missedOrders={missedOrders}
            />
          </TabsContent>
          
          <TabsContent value="orders" className="m-0 h-full">
            <OrdersTab isOnline={isOnline} />
          </TabsContent>
          
          <TabsContent value="earnings" className="m-0 h-full">
            <EarningsTab />
          </TabsContent>
          
          <TabsContent value="navigation" className="m-0 h-full">
            <NavigationTab />
          </TabsContent>
          
          <TabsContent value="profile" className="m-0 h-full">
            <ProfileTab />
          </TabsContent>
        </div>

        {/* Order Alert Overlay */}
        {incomingOrder && (
          <OrderAlert
            order={incomingOrder}
            onAccept={handleAcceptOrder}
            onDecline={handleDeclineOrder}
            onTimeout={handleOrderTimeout}
          />
        )}

        {/* Voice Assistant */}
        <VoiceAssistant
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          onAcceptOrder={incomingOrder ? handleAcceptOrder : undefined}
          onDeclineOrder={incomingOrder ? handleDeclineOrder : undefined}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasIncomingOrder={!!incomingOrder}
        />

        {/* Bottom Navigation */}
        <TabsList className="h-16 w-full rounded-none bg-white border-t border-border grid grid-cols-5">
          <TabsTrigger 
            value="dashboard" 
            className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="orders" 
            className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Orders</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="navigation" 
            className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Navigation className="h-5 w-5" />
            <span className="text-xs">Navigate</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="earnings" 
            className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs">Earnings</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="profile" 
            className="flex flex-col gap-1 h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}