import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  Package,
  Target,
  Download,
  Eye
} from 'lucide-react';

interface EarningsData {
  date: string;
  earnings: number;
  orders: number;
  hours: number;
  tips: number;
}

export function EarningsTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const dailyEarnings: EarningsData[] = [
    { date: '2024-01-15', earnings: 127.50, orders: 12, hours: 6.5, tips: 23.50 },
    { date: '2024-01-14', earnings: 142.75, orders: 15, hours: 7.2, tips: 28.75 },
    { date: '2024-01-13', earnings: 98.25, orders: 9, hours: 5.1, tips: 18.25 },
    { date: '2024-01-12', earnings: 156.00, orders: 18, hours: 8.0, tips: 31.00 },
    { date: '2024-01-11', earnings: 134.50, orders: 14, hours: 6.8, tips: 24.50 },
    { date: '2024-01-10', earnings: 119.75, orders: 11, hours: 6.2, tips: 21.75 },
    { date: '2024-01-09', earnings: 165.25, orders: 19, hours: 8.5, tips: 35.25 }
  ];

  const todayEarnings = dailyEarnings[0];
  const weeklyEarnings = dailyEarnings.reduce((acc, day) => ({
    earnings: acc.earnings + day.earnings,
    orders: acc.orders + day.orders,
    hours: acc.hours + day.hours,
    tips: acc.tips + day.tips
  }), { earnings: 0, orders: 0, hours: 0, tips: 0 });

  const monthlyEarnings = {
    earnings: 2847.50,
    orders: 164,
    hours: 87.2,
    tips: 347.50
  };

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'today': return todayEarnings;
      case 'week': return weeklyEarnings;
      case 'month': return monthlyEarnings;
      default: return todayEarnings;
    }
  };

  const currentData = getCurrentData();

  const EarningsCard = ({ title, amount, icon: Icon, change, changeType }: {
    title: string;
    amount: string;
    icon: any;
    change?: string;
    changeType?: 'positive' | 'negative';
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl">{amount}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">{change}</span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${
            title.includes('Earnings') ? 'text-green-500' :
            title.includes('Orders') ? 'text-blue-500' :
            title.includes('Hours') ? 'text-orange-500' :
            'text-purple-500'
          }`} />
        </div>
      </CardContent>
    </Card>
  );

  const DailyBreakdown = () => (
    <div className="space-y-3">
      {dailyEarnings.map((day, index) => (
        <Card key={day.date}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">{new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{day.orders} orders</span>
                  <span>{day.hours}h online</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg">${day.earnings}</p>
                <p className="text-sm text-muted-foreground">+${day.tips} tips</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl">Earnings</h1>
            <p className="text-sm text-muted-foreground">Track your income</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <EarningsCard
                title="Total Earnings"
                amount={`$${currentData.earnings.toFixed(2)}`}
                icon={DollarSign}
                change="+12.5%"
                changeType="positive"
              />
              
              <EarningsCard
                title="Total Orders"
                amount={currentData.orders.toString()}
                icon={Package}
                change="+8.3%"
                changeType="positive"
              />
              
              <EarningsCard
                title="Hours Online"
                amount={`${currentData.hours}h`}
                icon={Clock}
                change="+5.2%"
                changeType="positive"
              />
              
              <EarningsCard
                title="Tips Earned"
                amount={`$${currentData.tips.toFixed(2)}`}
                icon={Target}
                change="+15.7%"
                changeType="positive"
              />
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average per Order</span>
                  <span>${(currentData.earnings / currentData.orders).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average per Hour</span>
                  <span>${(currentData.earnings / currentData.hours).toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tips Percentage</span>
                  <span>{((currentData.tips / currentData.earnings) * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Orders per Hour</span>
                  <span>{(currentData.orders / currentData.hours).toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Earnings Goal: $150</span>
                    <span>{Math.round((todayEarnings.earnings / 150) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((todayEarnings.earnings / 150) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Orders Goal: 15</span>
                    <span>{Math.round((todayEarnings.orders / 15) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((todayEarnings.orders / 15) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Hours Goal: 8</span>
                    <span>{Math.round((todayEarnings.hours / 8) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((todayEarnings.hours / 8) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Breakdown (only show for weekly/monthly views) */}
            {selectedPeriod !== 'today' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Daily Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyBreakdown />
                </CardContent>
              </Card>
            )}

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cash Payments</span>
                  <span>$45.25 (35%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Card Payments</span>
                  <span>$58.75 (46%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Digital Wallet</span>
                  <span>$23.50 (19%)</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pb-6">
              <Button variant="outline" className="h-12">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" className="h-12">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}