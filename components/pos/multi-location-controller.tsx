'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Store, 
  Users, 
  DollarSign, 
  Clock, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Wifi,
  RotateCcw,
  Power,
  Shield
} from 'lucide-react';

interface LocationStatus {
  id: string;
  name: string;
  type: 'cafe' | 'restaurant' | 'quick_service' | 'retail' | 'kiosk';
  status: 'online' | 'offline' | 'maintenance' | 'closed';
  address: string;
  manager: string;
  
  // Real-time metrics
  todaysSales: number;
  transactionsToday: number;
  staffOnDuty: number;
  avgTicket: number;
  
  // Operational status
  currentShift: {
    id: string;
    startTime: string;
    manager: string;
    staff: number;
  } | null;
  
  // System health
  systemHealth: {
    pos_system: 'online' | 'offline' | 'warning';
    payment_processor: 'online' | 'offline' | 'warning';
    receipt_printer: 'online' | 'offline' | 'warning';
    network: 'online' | 'offline' | 'warning';
  };
  
  // Alerts and notifications
  alerts: {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }[];
  
  lastUpdate: string;
}

export function MultiLocationController() {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showSystemControls, setShowSystemControls] = useState(false);

  const mockLocations: LocationStatus[] = [
    {
      id: 'loc-1',
      name: 'Downtown Café',
      type: 'cafe',
      status: 'online',
      address: '123 Main St, Downtown',
      manager: 'Alice Johnson',
      todaysSales: 2450.75,
      transactionsToday: 89,
      staffOnDuty: 4,
      avgTicket: 27.53,
      currentShift: {
        id: 'shift-1',
        startTime: '08:00',
        manager: 'Alice Johnson',
        staff: 4
      },
      systemHealth: {
        pos_system: 'online',
        payment_processor: 'online',
        receipt_printer: 'warning',
        network: 'online'
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'warning',
          message: 'Receipt printer low on paper',
          timestamp: '10:30 AM'
        }
      ],
      lastUpdate: '2 minutes ago'
    },
    {
      id: 'loc-2',
      name: 'Mall Food Court',
      type: 'quick_service',
      status: 'online',
      address: '456 Shopping Center',
      manager: 'Bob Smith',
      todaysSales: 3220.50,
      transactionsToday: 156,
      staffOnDuty: 6,
      avgTicket: 20.64,
      currentShift: {
        id: 'shift-2',
        startTime: '10:00',
        manager: 'Bob Smith',
        staff: 6
      },
      systemHealth: {
        pos_system: 'online',
        payment_processor: 'online',
        receipt_printer: 'online',
        network: 'online'
      },
      alerts: [],
      lastUpdate: '1 minute ago'
    },
    {
      id: 'loc-3',
      name: 'Airport Terminal',
      type: 'kiosk',
      status: 'maintenance',
      address: '789 Airport Rd',
      manager: 'Carol Williams',
      todaysSales: 850.25,
      transactionsToday: 42,
      staffOnDuty: 1,
      avgTicket: 20.24,
      currentShift: null,
      systemHealth: {
        pos_system: 'offline',
        payment_processor: 'offline',
        receipt_printer: 'offline',
        network: 'warning'
      },
      alerts: [
        {
          id: 'alert-2',
          type: 'error',
          message: 'POS system offline - scheduled maintenance',
          timestamp: '09:00 AM'
        }
      ],
      lastUpdate: '15 minutes ago'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'closed': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'online': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'offline': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return <AlertTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  const filteredLocations = selectedLocation === 'all' 
    ? mockLocations 
    : mockLocations.filter(loc => loc.id === selectedLocation);

  const totalSales = mockLocations.reduce((sum, loc) => sum + loc.todaysSales, 0);
  const totalTransactions = mockLocations.reduce((sum, loc) => sum + loc.transactionsToday, 0);
  const onlineLocations = mockLocations.filter(loc => loc.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Multi-Location Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Multi-Location Control Center</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {mockLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Sales Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
              <div className="text-sm text-gray-500">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{onlineLocations}/{mockLocations.length}</div>
              <div className="text-sm text-gray-500">Locations Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${(totalSales / totalTransactions || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Average Ticket</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Cards */}
      <div className="grid gap-6">
        {filteredLocations.map((location) => (
          <Card key={location.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Store className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                  <Badge className={`${getStatusColor(location.status)} border`}>
                    {getStatusIcon(location.status)}
                    <span className="ml-1 capitalize">{location.status}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Updated {location.lastUpdate}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Monitor className="h-4 w-4 mr-2" />
                        Controls
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Remote Location Controls - {location.name}</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="system">System</TabsTrigger>
                          <TabsTrigger value="staff">Staff</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-800">
                                ${location.todaysSales.toFixed(2)}
                              </div>
                              <div className="text-sm text-green-600">Today's Sales</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-800">
                                {location.transactionsToday}
                              </div>
                              <div className="text-sm text-blue-600">Transactions</div>
                            </div>
                          </div>
                          
                          {location.alerts.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Active Alerts</h4>
                              {location.alerts.map(alert => (
                                <div key={alert.id} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <span className="flex-1 text-sm">{alert.message}</span>
                                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="system" className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-medium">System Health</h4>
                            {Object.entries(location.systemHealth).map(([system, status]) => (
                              <div key={system} className="flex items-center justify-between p-2 border rounded">
                                <span className="capitalize">{system.replace('_', ' ')}</span>
                                <div className="flex items-center space-x-2">
                                  {getSystemHealthIcon(status)}
                                  <span className="text-sm capitalize">{status}</span>
                                  {status !== 'online' && (
                                    <Button size="sm" variant="outline">
                                      <Power className="h-3 w-3 mr-1" />
                                      Reset
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="staff" className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">Current Shift</h4>
                              {location.currentShift && (
                                <Badge variant="default">Active</Badge>
                              )}
                            </div>
                            
                            {location.currentShift ? (
                              <div className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">Manager: {location.currentShift.manager}</div>
                                    <div className="text-sm text-gray-600">
                                      Started: {location.currentShift.startTime} • {location.currentShift.staff} staff on duty
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 border border-dashed rounded-lg text-center text-gray-500">
                                No active shift
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      ${location.todaysSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Sales Today</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-600">
                      {location.transactionsToday}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Transactions</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-600">
                      {location.staffOnDuty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Staff on Duty</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-600">
                      ${location.avgTicket.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Avg Ticket</div>
                </div>
              </div>

              {/* System Health Indicators */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Health</span>
                  <div className="flex space-x-3">
                    {Object.entries(location.systemHealth).map(([system, status]) => (
                      <div key={system} className="flex items-center space-x-1">
                        {getSystemHealthIcon(status)}
                        <span className="text-xs capitalize">{system.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {location.alerts.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {location.alerts.length} Alert{location.alerts.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-yellow-600">
                      {location.alerts[0].message}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}