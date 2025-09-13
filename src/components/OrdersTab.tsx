import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Package,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle,
  XCircle,
  Power,
  AlertTriangle
} from 'lucide-react';

interface Order {
  id: string;
  status: 'available' | 'accepted' | 'picked_up' | 'delivered';
  pickup: {
    name: string;
    address: string;
    time: string;
  };
  delivery: {
    name: string;
    address: string;
    time: string;
    phone: string;
  };
  payment: number;
  distance: string;
  items: number;
}

interface OrdersTabProps {
  isOnline: boolean;
}

export function OrdersTab({ isOnline }: OrdersTabProps) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      status: 'picked_up',
      pickup: {
        name: 'Downtown Store',
        address: '456 Commerce St',
        time: '2:30 PM'
      },
      delivery: {
        name: 'Sarah Johnson',
        address: '123 Main St, Apt 4B',
        time: '3:00 PM',
        phone: '+1 (555) 123-4567'
      },
      payment: 12.50,
      distance: '2.3 km',
      items: 3
    },
    {
      id: 'ORD-2024-002',
      status: 'accepted',
      pickup: {
        name: 'Tech Plaza',
        address: '789 Innovation Ave',
        time: '3:15 PM'
      },
      delivery: {
        name: 'Mike Chen',
        address: '321 Oak Street',
        time: '3:45 PM',
        phone: '+1 (555) 987-6543'
      },
      payment: 15.75,
      distance: '3.1 km',
      items: 5
    },
    {
      id: 'ORD-2024-003',
      status: 'available',
      pickup: {
        name: 'City Mall',
        address: '101 Shopping Blvd',
        time: '4:00 PM'
      },
      delivery: {
        name: 'Lisa Wang',
        address: '567 Pine Ave',
        time: '4:30 PM',
        phone: '+1 (555) 456-7890'
      },
      payment: 18.25,
      distance: '4.2 km',
      items: 2
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'accepted': return 'bg-blue-500';
      case 'picked_up': return 'bg-orange-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'accepted': return 'Accepted';
      case 'picked_up': return 'Picked Up';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'accepted' as const } : order
    ));
  };

  const handlePickupOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'picked_up' as const } : order
    ));
  };

  const handleDeliverOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'delivered' as const } : order
    ));
  };

  const availableOrders = orders.filter(order => order.status === 'available');
  const activeOrders = orders.filter(order => ['accepted', 'picked_up'].includes(order.status));
  const completedOrders = orders.filter(order => order.status === 'delivered');

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{order.id}</CardTitle>
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pickup Location */}
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm">Pickup from</p>
            <p>{order.pickup.name}</p>
            <p className="text-sm text-muted-foreground">{order.pickup.address}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{order.pickup.time}</span>
            </div>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
          <div className="flex-1">
            <p className="text-sm">Deliver to</p>
            <p>{order.delivery.name}</p>
            <p className="text-sm text-muted-foreground">{order.delivery.address}</p>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{order.delivery.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{order.items} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span>${order.payment}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{order.distance}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {order.status === 'available' && (
            <>
              <Button 
                className="flex-1"
                onClick={() => handleAcceptOrder(order.id)}
              >
                Accept Order
              </Button>
              <Button variant="outline" size="icon">
                <Navigation className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {order.status === 'accepted' && (
            <>
              <Button 
                className="flex-1"
                onClick={() => handlePickupOrder(order.id)}
              >
                Mark as Picked Up
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Navigation className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {order.status === 'picked_up' && (
            <>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleDeliverOrder(order.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Delivered
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {order.status === 'delivered' && (
            <div className="flex items-center gap-2 text-green-600 w-full justify-center py-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Completed</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-xl">Orders</h1>
        <p className="text-sm text-muted-foreground">Manage your deliveries</p>
      </div>

      <Tabs defaultValue="available" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="available">
            Available ({availableOrders.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="available" className="p-4 m-0">
            {!isOnline ? (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6 text-center">
                  <Power className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                  <h3 className="text-lg mb-2">You're Offline</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Go online to see available orders in your area
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Switch to Dashboard to go online</span>
                  </div>
                </CardContent>
              </Card>
            ) : availableOrders.length > 0 ? (
              availableOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No available orders at the moment</p>
                <p className="text-sm">Stay online to receive new orders!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="p-4 m-0">
            {activeOrders.length > 0 ? (
              activeOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No active orders
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="p-4 m-0">
            {completedOrders.length > 0 ? (
              completedOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No completed orders today
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}