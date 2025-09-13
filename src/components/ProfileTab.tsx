import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  Car, 
  FileText, 
  Settings,
  Star,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Camera,
  Edit,
  Check,
  AlertCircle,
  CreditCard,
  Bell,
  Moon,
  Globe,
  HelpCircle
} from 'lucide-react';

export function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const driverProfile = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    address: '789 Oak Street, City, State 12345',
    joinDate: 'January 2023',
    rating: 4.9,
    totalDeliveries: 1247,
    status: 'Verified',
    profileImage: '/api/placeholder/100/100'
  };

  const vehicleInfo = {
    type: 'Motorcycle',
    make: 'Honda',
    model: 'CBR 150R',
    year: '2022',
    color: 'Red',
    plateNumber: 'ABC-1234',
    insurance: 'Valid until Dec 2024'
  };

  const documents = [
    { name: 'Driver\'s License', status: 'Verified', expiryDate: '2026-03-15' },
    { name: 'Vehicle Registration', status: 'Verified', expiryDate: '2025-08-22' },
    { name: 'Insurance Certificate', status: 'Verified', expiryDate: '2024-12-10' },
    { name: 'Background Check', status: 'Verified', expiryDate: '2025-01-20' }
  ];

  const ProfileInfo = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={driverProfile.profileImage} />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl">{driverProfile.name}</h2>
                <Badge className="bg-green-500 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  {driverProfile.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span>{driverProfile.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({driverProfile.totalDeliveries} deliveries)
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Member since {driverProfile.joinDate}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input 
                id="email" 
                value={driverProfile.email} 
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input 
                id="phone" 
                value={driverProfile.phone} 
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Input 
                id="address" 
                value={driverProfile.address} 
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl text-green-600">4.9</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl text-blue-600">98%</p>
            <p className="text-sm text-muted-foreground">On-time Rate</p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl text-purple-600">1,247</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl text-orange-600">15</p>
            <p className="text-sm text-muted-foreground">Months Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const VehicleInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehicle Type</Label>
              <Input value={vehicleInfo.type} disabled={!isEditing} className="mt-1" />
            </div>
            
            <div>
              <Label>Make</Label>
              <Input value={vehicleInfo.make} disabled={!isEditing} className="mt-1" />
            </div>
            
            <div>
              <Label>Model</Label>
              <Input value={vehicleInfo.model} disabled={!isEditing} className="mt-1" />
            </div>
            
            <div>
              <Label>Year</Label>
              <Input value={vehicleInfo.year} disabled={!isEditing} className="mt-1" />
            </div>
            
            <div>
              <Label>Color</Label>
              <Input value={vehicleInfo.color} disabled={!isEditing} className="mt-1" />
            </div>
            
            <div>
              <Label>Plate Number</Label>
              <Input value={vehicleInfo.plateNumber} disabled={!isEditing} className="mt-1" />
            </div>
          </div>
          
          <div>
            <Label>Insurance Status</Label>
            <Input value={vehicleInfo.insurance} disabled className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            <Camera className="h-4 w-4 mr-2" />
            Update Vehicle Photos
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p>{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  <Check className="h-3 w-3 mr-1" />
                  {doc.status}
                </Badge>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button variant="outline" className="w-full">
        <FileText className="h-4 w-4 mr-2" />
        Upload New Document
      </Button>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label>Push Notifications</Label>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <Label>Dark Mode</Label>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={setDarkMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label>Language</Label>
            </div>
            <Button variant="outline" size="sm">
              English
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Methods
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Privacy & Security
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help & Support
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Terms & Conditions
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label>Contact Name</Label>
              <Input placeholder="Emergency contact name" className="mt-1" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input placeholder="Emergency contact phone" className="mt-1" />
            </div>
          </div>
          <Button className="w-full mt-4">
            Save Emergency Contact
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full" size="lg">
          Sign Out
        </Button>
        
        <Button variant="destructive" className="w-full" size="lg">
          Deactivate Account
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-xl">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="profile" className="p-4 m-0">
            <ProfileInfo />
          </TabsContent>
          
          <TabsContent value="vehicle" className="p-4 m-0">
            <VehicleInfo />
          </TabsContent>
          
          <TabsContent value="documents" className="p-4 m-0">
            <DocumentsTab />
          </TabsContent>
          
          <TabsContent value="settings" className="p-4 m-0">
            <SettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}