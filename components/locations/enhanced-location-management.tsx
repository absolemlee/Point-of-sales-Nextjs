'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Store, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Settings,
  Plus,
  Edit,
  Eye,
  Calculator,
  BarChart3
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED';
  address: string;
  coordinates: { lat: number; lng: number };
  operatingHours: {
    [key: string]: { isOpen: boolean; open: string; close: string };
  };
  staff: {
    total: number;
    active: number;
    onBreak: number;
  };
  inventory: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
  };
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  performance: {
    averageTransactionValue: number;
    transactionsToday: number;
    hourlyAverage: number;
  };
}

export function EnhancedLocationManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setLocations([
      {
        id: 'loc-1',
        name: 'Downtown Coffee Shop',
        type: 'STATIC',
        status: 'ACTIVE',
        address: '123 Main St, Downtown',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        operatingHours: {
          monday: { isOpen: true, open: '07:00', close: '18:00' },
          tuesday: { isOpen: true, open: '07:00', close: '18:00' },
          wednesday: { isOpen: true, open: '07:00', close: '18:00' },
          thursday: { isOpen: true, open: '07:00', close: '18:00' },
          friday: { isOpen: true, open: '07:00', close: '20:00' },
          saturday: { isOpen: true, open: '08:00', close: '20:00' },
          sunday: { isOpen: true, open: '08:00', close: '17:00' }
        },
        staff: { total: 8, active: 6, onBreak: 2 },
        inventory: { totalProducts: 45, lowStock: 5, outOfStock: 2 },
        sales: { today: 1250.75, thisWeek: 8340.25, thisMonth: 32450.80 },
        performance: { averageTransactionValue: 12.50, transactionsToday: 102, hourlyAverage: 15.3 }
      },
      {
        id: 'loc-2',
        name: 'Mall Kiosk',
        type: 'POPUP',
        status: 'ACTIVE',
        address: 'Central Mall, Level 2',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        operatingHours: {
          monday: { isOpen: true, open: '10:00', close: '21:00' },
          tuesday: { isOpen: true, open: '10:00', close: '21:00' },
          wednesday: { isOpen: true, open: '10:00', close: '21:00' },
          thursday: { isOpen: true, open: '10:00', close: '21:00' },
          friday: { isOpen: true, open: '10:00', close: '22:00' },
          saturday: { isOpen: true, open: '10:00', close: '22:00' },
          sunday: { isOpen: true, open: '11:00', close: '20:00' }
        },
        staff: { total: 4, active: 3, onBreak: 1 },
        inventory: { totalProducts: 32, lowStock: 8, outOfStock: 1 },
        sales: { today: 875.30, thisWeek: 5420.15, thisMonth: 21340.60 },
        performance: { averageTransactionValue: 8.75, transactionsToday: 78, hourlyAverage: 12.1 }
      },
      {
        id: 'loc-3',
        name: 'University Partnership',
        type: 'VENUE_PARTNERSHIP',
        status: 'SCHEDULED',
        address: 'State University Campus',
        coordinates: { lat: 40.6892, lng: -74.0445 },
        operatingHours: {
          monday: { isOpen: true, open: '08:00', close: '16:00' },
          tuesday: { isOpen: true, open: '08:00', close: '16:00' },
          wednesday: { isOpen: true, open: '08:00', close: '16:00' },
          thursday: { isOpen: true, open: '08:00', close: '16:00' },
          friday: { isOpen: true, open: '08:00', close: '15:00' },
          saturday: { isOpen: false, open: '', close: '' },
          sunday: { isOpen: false, open: '', close: '' }
        },
        staff: { total: 6, active: 4, onBreak: 0 },
        inventory: { totalProducts: 28, lowStock: 3, outOfStock: 0 },
        sales: { today: 645.20, thisWeek: 3220.45, thisMonth: 15670.30 },
        performance: { averageTransactionValue: 10.75, transactionsToday: 60, hourlyAverage: 9.5 }
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STATIC': return 'bg-purple-100 text-purple-800';
      case 'POPUP': return 'bg-orange-100 text-orange-800';
      case 'VENUE_PARTNERSHIP': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
            <p className="text-gray-600 mt-1">Manage all your business locations and their operations</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Location Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Store className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={getStatusColor(location.status)}>
                      {location.status}
                    </Badge>
                    <Badge className={getTypeColor(location.type)}>
                      {location.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${location.sales.today.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Today's Sales</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {location.performance.transactionsToday}
                    </div>
                    <div className="text-sm text-gray-600">Transactions</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff Active:</span>
                    <span className="font-medium">{location.staff.active}/{location.staff.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Stock Items:</span>
                    <span className="font-medium text-orange-600">{location.inventory.lowStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Transaction:</span>
                    <span className="font-medium">${location.performance.averageTransactionValue.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/pos?location=${location.id}`, '_blank')}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    POS
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Location View */}
        {selectedLocation && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{selectedLocation.name} - Detailed View</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedLocation(null)}>
                  ✕ Close
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="staff">Staff</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                            <p className="text-2xl font-bold text-green-600">
                              ${selectedLocation.sales.today.toFixed(2)}
                            </p>
                          </div>
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Transactions</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedLocation.performance.transactionsToday}
                            </p>
                          </div>
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Staff</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedLocation.staff.active}
                            </p>
                          </div>
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Hourly Average</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {selectedLocation.performance.hourlyAverage}
                            </p>
                          </div>
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Operating Hours</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(selectedLocation.operatingHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between items-center py-1">
                              <span className="capitalize font-medium">{day}:</span>
                              <span className={hours.isOpen ? 'text-green-600' : 'text-red-600'}>
                                {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(`/pos?location=${selectedLocation.id}`, '_blank')}
                          >
                            <Calculator className="h-4 w-4 mr-2" />
                            Open POS
                          </Button>
                          <Button variant="outline" size="sm">
                            <Package className="h-4 w-4 mr-2" />
                            Manage Inventory
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Users className="h-4 w-4 mr-2" />
                            Staff Schedule
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Location Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="sales">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedLocation.sales.today.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">Today</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            ${selectedLocation.sales.thisWeek.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">This Week</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            ${selectedLocation.sales.thisMonth.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">This Month</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Sales Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Transaction Analytics</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Average Transaction Value:</span>
                                <span className="font-bold">${selectedLocation.performance.averageTransactionValue.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transactions Today:</span>
                                <span className="font-bold">{selectedLocation.performance.transactionsToday}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hourly Average:</span>
                                <span className="font-bold">{selectedLocation.performance.hourlyAverage} tx/hr</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Revenue Breakdown</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Daily Average:</span>
                                <span className="font-bold">${(selectedLocation.sales.thisMonth / 30).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Weekly Average:</span>
                                <span className="font-bold">${(selectedLocation.sales.thisMonth / 4).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Growth Rate:</span>
                                <span className="font-bold text-green-600">+15.3%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="inventory">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedLocation.inventory.totalProducts}
                          </div>
                          <div className="text-sm text-gray-600">Total Products</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedLocation.inventory.lowStock}
                          </div>
                          <div className="text-sm text-gray-600">Low Stock</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {selectedLocation.inventory.outOfStock}
                          </div>
                          <div className="text-sm text-gray-600">Out of Stock</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Inventory Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button className="w-full">
                            <Package className="h-4 w-4 mr-2" />
                            View Full Inventory
                          </Button>
                          <Button variant="outline" className="w-full">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Restock Alerts
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="staff">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedLocation.staff.total}
                          </div>
                          <div className="text-sm text-gray-600">Total Staff</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedLocation.staff.active}
                          </div>
                          <div className="text-sm text-gray-600">Active Now</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedLocation.staff.onBreak}
                          </div>
                          <div className="text-sm text-gray-600">On Break</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Staff Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button className="w-full">
                            <Users className="h-4 w-4 mr-2" />
                            View Staff Schedule
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Clock className="h-4 w-4 mr-2" />
                            Time Clock Management
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Location Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          General Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Clock className="h-4 w-4 mr-2" />
                          Operating Hours
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location Details
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pricing & Tax Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}