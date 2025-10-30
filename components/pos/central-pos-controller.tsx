'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocationSensitiveMenuBuilder } from './location-sensitive-menu-builder';
import { IntegratedShiftManager } from './integrated-shift-manager';
import { POSConfigurationPanel } from './pos-configuration-panel';
import { MultiLocationController } from './multi-location-controller';
import { 
  Calculator, 
  MapPin, 
  Users, 
  Settings, 
  Clock, 
  ShoppingCart, 
  CreditCard, 
  DollarSign,
  Package,
  Coffee,
  ChefHat,
  Utensils,
  Timer,
  UserCheck,
  UserX,
  Edit,
  Plus,
  Minus,
  Trash2,
  Save,
  RotateCcw,
  Shield,
  Key,
  Monitor,
  Printer,
  Wifi
} from 'lucide-react';

// Enhanced interfaces for role-based system
interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  level: 'cashier' | 'supervisor' | 'manager' | 'admin';
}

interface Location {
  id: string;
  name: string;
  type: 'cafe' | 'restaurant' | 'quick_service' | 'retail' | 'kiosk';
  address: string;
  status: 'active' | 'closed' | 'maintenance';
  currentShift: Shift | null;
  menu: MenuItem[];
  staff: StaffMember[];
  settings: LocationSettings;
}

interface Shift {
  id: string;
  locationId: string;
  startTime: string;
  endTime?: string;
  staffOnDuty: StaffMember[];
  manager: StaffMember;
  status: 'active' | 'ended' | 'break';
  sales: number;
  transactions: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  clockedIn: boolean;
  clockInTime?: string;
  breakStatus: 'none' | 'on_break' | 'returning';
  permissions: string[];
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  preparationTime: number;
  allergens: string[];
  locationTypes: string[];
  customizable: boolean;
  modifiers: MenuModifier[];
}

interface MenuModifier {
  id: string;
  name: string;
  price: number;
  category: 'size' | 'extra' | 'substitute';
}

interface LocationSettings {
  taxRate: number;
  serviceCharge: number;
  paymentMethods: string[];
  allowDiscounts: boolean;
  requireManagerApproval: {
    voids: boolean;
    refunds: boolean;
    discounts: boolean;
  };
  menuAvailability: {
    breakfast: { start: string; end: string };
    lunch: { start: string; end: string };
    dinner: { start: string; end: string };
  };
}

export function CentralPOSController() {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState<any[]>([]);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [showMenuBuilder, setShowMenuBuilder] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Mock data - would come from API in real implementation
  const mockRoles: UserRole[] = [
    {
      id: 'cashier',
      name: 'Cashier',
      permissions: ['process_sales', 'view_menu', 'clock_in_out'],
      level: 'cashier'
    },
    {
      id: 'supervisor',
      name: 'Supervisor', 
      permissions: ['process_sales', 'view_menu', 'clock_in_out', 'manage_shifts', 'void_transactions', 'apply_discounts'],
      level: 'supervisor'
    },
    {
      id: 'manager',
      name: 'Manager',
      permissions: ['all', 'manage_menu', 'manage_staff', 'configure_location', 'view_reports', 'system_settings'],
      level: 'manager'
    },
    {
      id: 'admin',
      name: 'Admin',
      permissions: ['system_admin', 'all_locations', 'user_management', 'system_configuration'],
      level: 'admin'
    }
  ];

  const mockLocations: Location[] = [
    {
      id: 'loc-1',
      name: 'Downtown Café',
      type: 'cafe',
      address: '123 Main St, Downtown',
      status: 'active',
      currentShift: {
        id: 'shift-1',
        locationId: 'loc-1',
        startTime: '08:00',
        staffOnDuty: [],
        manager: {
          id: 'mgr-1',
          name: 'Alice Johnson',
          role: mockRoles[2],
          clockedIn: true,
          clockInTime: '08:00',
          breakStatus: 'none',
          permissions: mockRoles[2].permissions
        },
        status: 'active',
        sales: 1250.75,
        transactions: 48
      },
      menu: [
        {
          id: 'item-1',
          name: 'Americano',
          category: 'Coffee',
          price: 3.50,
          available: true,
          preparationTime: 3,
          allergens: [],
          locationTypes: ['cafe', 'restaurant'],
          customizable: true,
          modifiers: [
            { id: 'mod-1', name: 'Extra Shot', price: 0.75, category: 'extra' },
            { id: 'mod-2', name: 'Oat Milk', price: 0.60, category: 'substitute' }
          ]
        },
        {
          id: 'item-2',
          name: 'Croissant',
          category: 'Pastry',
          price: 2.75,
          available: true,
          preparationTime: 1,
          allergens: ['gluten', 'eggs'],
          locationTypes: ['cafe', 'quick_service'],
          customizable: false,
          modifiers: []
        }
      ],
      staff: [],
      settings: {
        taxRate: 8.5,
        serviceCharge: 0,
        paymentMethods: ['cash', 'card', 'mobile'],
        allowDiscounts: true,
        requireManagerApproval: {
          voids: true,
          refunds: true,
          discounts: false
        },
        menuAvailability: {
          breakfast: { start: '06:00', end: '11:00' },
          lunch: { start: '11:00', end: '16:00' },
          dinner: { start: '16:00', end: '22:00' }
        }
      }
    }
  ];

  useEffect(() => {
    // Initialize with manager permissions for demo
    setCurrentUser({
      id: 'user-1',
      name: 'John Manager',
      role: mockRoles[2],
      clockedIn: true,
      clockInTime: '08:00',
      breakStatus: 'none',
      permissions: mockRoles[2].permissions
    });
    setSelectedLocation(mockLocations[0]);
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes('all') || 
           currentUser.permissions.includes(permission) ||
           currentUser.permissions.includes('system_admin');
  };

  const addToCart = (item: MenuItem) => {
    setCart([...cart, { ...item, quantity: 1, modifiers: [] }]);
  };

  const ShiftManagementPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Shift Control Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedLocation?.currentShift && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-green-800">Current Shift Active</h3>
                <p className="text-sm text-green-600">
                  Started: {selectedLocation.currentShift.startTime} | 
                  Manager: {selectedLocation.currentShift.manager.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">
                  ${selectedLocation.currentShift.sales.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">
                  {selectedLocation.currentShift.transactions} transactions
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={!hasPermission('manage_shifts')}
              >
                <UserCheck className="h-4 w-4" />
                <span>Clock In Staff</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={!hasPermission('manage_shifts')}
              >
                <UserX className="h-4 w-4" />
                <span>Clock Out Staff</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={!hasPermission('manage_shifts')}
              >
                <Timer className="h-4 w-4" />
                <span>Break Manager</span>
              </Button>
              <Button 
                variant="destructive" 
                className="flex items-center space-x-2"
                disabled={!hasPermission('manage_shifts')}
              >
                <Clock className="h-4 w-4" />
                <span>End Shift</span>
              </Button>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Staff On Duty</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{currentUser?.name}</span>
                    <Badge variant="secondary">{currentUser?.role.name}</Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {currentUser?.clockInTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MenuBuilderPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChefHat className="h-5 w-5" />
          <span>Dynamic Menu Builder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Menu for {selectedLocation?.type} location</h4>
            <Button 
              size="sm" 
              className="flex items-center space-x-2"
              disabled={!hasPermission('manage_menu')}
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {selectedLocation?.menu.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant={item.available ? "default" : "secondary"}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                      {item.customizable && (
                        <Badge variant="outline">Customizable</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.category} • ${item.price.toFixed(2)} • {item.preparationTime}min
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!hasPermission('manage_menu')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={item.available ? "destructive" : "default"}
                      disabled={!hasPermission('manage_menu')}
                    >
                      {item.available ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );

  const LocationConfigPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Location Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input 
              id="tax-rate" 
              type="number" 
              value={selectedLocation?.settings.taxRate || 0}
              disabled={!hasPermission('configure_location')}
            />
          </div>
          <div>
            <Label htmlFor="service-charge">Service Charge (%)</Label>
            <Input 
              id="service-charge" 
              type="number" 
              value={selectedLocation?.settings.serviceCharge || 0}
              disabled={!hasPermission('configure_location')}
            />
          </div>
        </div>

        <div>
          <Label>Payment Methods</Label>
          <div className="flex space-x-2 mt-2">
            {['cash', 'card', 'mobile', 'crypto'].map((method) => (
              <Badge 
                key={method}
                variant={selectedLocation?.settings.paymentMethods.includes(method) ? "default" : "outline"}
                className="cursor-pointer"
              >
                {method}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Manager Approval Required</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Void Transactions</span>
              <Badge variant={selectedLocation?.settings.requireManagerApproval.voids ? "destructive" : "secondary"}>
                {selectedLocation?.settings.requireManagerApproval.voids ? 'Required' : 'Not Required'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Refunds</span>
              <Badge variant={selectedLocation?.settings.requireManagerApproval.refunds ? "destructive" : "secondary"}>
                {selectedLocation?.settings.requireManagerApproval.refunds ? 'Required' : 'Not Required'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Discounts</span>
              <Badge variant={selectedLocation?.settings.requireManagerApproval.discounts ? "destructive" : "secondary"}>
                {selectedLocation?.settings.requireManagerApproval.discounts ? 'Required' : 'Not Required'}
              </Badge>
            </div>
          </div>
        </div>

        {hasPermission('configure_location') && (
          <Button className="w-full flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with User and Location Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">Central POS Controller</h1>
                  <p className="text-gray-600">Complete location and operations management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">{currentUser?.name}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">{currentUser?.role.name}</Badge>
                    <Badge variant={currentUser?.clockedIn ? "default" : "secondary"}>
                      {currentUser?.clockedIn ? 'Clocked In' : 'Clocked Out'}
                    </Badge>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-right">
                  <div className="font-medium flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedLocation?.name}</span>
                  </div>
                  <Badge variant={selectedLocation?.status === 'active' ? "default" : "secondary"}>
                    {selectedLocation?.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main POS Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pos" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>POS</span>
            </TabsTrigger>
            <TabsTrigger 
              value="shifts" 
              className="flex items-center space-x-2"
              disabled={!hasPermission('manage_shifts')}
            >
              <Clock className="h-4 w-4" />
              <span>Shifts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="menu" 
              className="flex items-center space-x-2"
              disabled={!hasPermission('manage_menu')}
            >
              <ChefHat className="h-4 w-4" />
              <span>Menu</span>
            </TabsTrigger>
            <TabsTrigger 
              value="config" 
              className="flex items-center space-x-2"
              disabled={!hasPermission('configure_location')}
            >
              <Settings className="h-4 w-4" />
              <span>Config</span>
            </TabsTrigger>
            <TabsTrigger 
              value="locations" 
              className="flex items-center space-x-2"
              disabled={!hasPermission('all_locations')}
            >
              <MapPin className="h-4 w-4" />
              <span>Locations</span>
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex items-center space-x-2"
              disabled={!hasPermission('system_settings')}
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos">
            <div className="grid grid-cols-3 gap-6">
              {/* Menu Items */}
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLocation?.menu.filter(item => item.available).map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="h-auto p-4 text-left"
                          onClick={() => addToCart(item)}
                        >
                          <div className="w-full">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cart and Payment */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-48">
                      {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No items in cart</p>
                      ) : (
                        <div className="space-y-2">
                          {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border rounded">
                              <span>{item.name}</span>
                              <span>${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {cart.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${(cart.reduce((sum, item) => sum + item.price, 0) * (selectedLocation?.settings.taxRate || 0) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>${(cart.reduce((sum, item) => sum + item.price, 0) * (1 + (selectedLocation?.settings.taxRate || 0) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button className="w-full flex items-center space-x-2">
                            <CreditCard className="h-4 w-4" />
                            <span>Pay with Card</span>
                          </Button>
                          <Button variant="outline" className="w-full flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Pay with Cash</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shifts">
            <IntegratedShiftManager />
          </TabsContent>

          <TabsContent value="menu">
            <LocationSensitiveMenuBuilder />
          </TabsContent>

          <TabsContent value="config">
            <POSConfigurationPanel />
          </TabsContent>

          <TabsContent value="locations">
            <MultiLocationController />
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>System Administration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>User Management</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Printer className="h-4 w-4" />
                    <span>Printer Setup</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4" />
                    <span>Network Settings</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>System Backup</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}