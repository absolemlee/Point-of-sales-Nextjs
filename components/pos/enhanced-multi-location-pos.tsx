'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/lib/auth/user-context';
import { KavaPRRole } from '@/schema/kavap-r-types';
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
  Shield,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Activity,
  Bell,
  Printer,
  CreditCard,
  Calculator,
  ShoppingCart
} from 'lucide-react';

interface LocationProfile {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP' | 'EVENT' | 'MOBILE';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED' | 'MAINTENANCE';
  address: string;
  coordinates: { lat: number; lng: number };
  contactInfo: {
    phone?: string;
    email?: string;
    manager: string;
    managerId: string;
  };
  capabilities: {
    hasKitchen: boolean;
    hasSeating: boolean;
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDriveThru: boolean;
    acceptsCash: boolean;
    acceptsCard: boolean;
    acceptsMobile: boolean;
    hasWifi: boolean;
    hasPrinter: boolean;
    hasKDS: boolean;
  };
  posConfiguration: {
    terminalId: string;
    merchantId: string;
    taxRate: number;
    tipOptions: number[];
    receiptFooter: string;
    requireSignature: boolean;
    enableInventoryTracking: boolean;
  };
  staffing: {
    currentStaff: number;
    scheduledStaff: number;
    requiredStaff: number;
    maxCapacity: number;
  };
  performance: {
    dailyTarget: number;
    weeklyTarget: number;
    monthlyTarget: number;
    averageTicket: number;
    peakHours: string[];
  };
}

interface LocationMetrics {
  locationId: string;
  dailySales: number;
  transactionCount: number;
  averageTicket: number;
  staffOnDuty: number;
  currentShift?: {
    id: string;
    startTime: string;
    managerId: string;
    staffCount: number;
  };
  systemStatus: {
    posSystem: 'online' | 'offline' | 'warning';
    paymentProcessor: 'online' | 'offline' | 'warning';
    printer: 'online' | 'offline' | 'warning';
    network: 'online' | 'offline' | 'warning';
  };
  alerts: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>;
  lastUpdate: string;
}

export function EnhancedMultiLocationPOS() {
  const { user } = useUser();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [locations, setLocations] = useState<LocationProfile[]>([]);
  const [metrics, setMetrics] = useState<LocationMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'control'>('overview');

  // Check user permissions for location access
  const canManageAllLocations = user?.role === KavaPRRole.SUPERADMIN || 
                                user?.role === KavaPRRole.FULLADMIN || 
                                user?.role === KavaPRRole.OWNER;
  
  const canManageLocation = (locationId: string) => {
    if (canManageAllLocations) return true;
    if (user?.role === KavaPRRole.ADMIN || user?.role === KavaPRRole.MANAGER) return true;
    // Add location-specific permissions logic here
    return false;
  };

  const canViewLocationDetails = (locationId: string) => {
    return canManageLocation(locationId) || 
           user?.role === KavaPRRole.SUPERVISOR || 
           user?.role === KavaPRRole.COORDINATOR;
  };

  useEffect(() => {
    fetchLocationData();
    const interval = setInterval(fetchMetrics, 30000); // Update metrics every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const [profilesResponse, metricsResponse] = await Promise.all([
        fetch('/api/locations/profiles'),
        fetch('/api/locations/metrics')
      ]);

      if (profilesResponse.ok) {
        const profilesData = await profilesResponse.json();
        setLocations(profilesData.profiles || []);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics || []);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/locations/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const getLocationMetrics = (locationId: string): LocationMetrics | undefined => {
    return metrics.find(m => m.locationId === locationId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'INACTIVE': return 'bg-gray-500';
      case 'MAINTENANCE': return 'bg-yellow-500';
      case 'CLOSED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredLocations = selectedLocation === 'all' 
    ? locations 
    : locations.filter(loc => loc.id === selectedLocation);

  const totalSales = metrics.reduce((sum, m) => sum + m.dailySales, 0);
  const totalTransactions = metrics.reduce((sum, m) => sum + m.transactionCount, 0);
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const activeLocations = locations.filter(loc => loc.status === 'ACTIVE').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Monitor className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading POS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Multi-Location POS Control Center</h1>
          <p className="text-muted-foreground">
            {canManageAllLocations ? 'Executive Dashboard' : 'Location Management'} • {activeLocations} Active Locations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {canManageAllLocations && (
            <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Location Name</Label>
                      <Input id="name" placeholder="Enter location name" />
                    </div>
                    <div>
                      <Label htmlFor="type">Location Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STATIC">Static Location</SelectItem>
                          <SelectItem value="POPUP">Pop-up</SelectItem>
                          <SelectItem value="VENUE_PARTNERSHIP">Venue Partnership</SelectItem>
                          <SelectItem value="EVENT">Event</SelectItem>
                          <SelectItem value="MOBILE">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter full address" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowLocationDialog(false)}>
                      Create Location
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Sales</p>
                <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Ticket</p>
                <p className="text-2xl font-bold">${averageTicket.toFixed(2)}</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Locations</p>
                <p className="text-2xl font-bold">{activeLocations}</p>
              </div>
              <Store className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          {canManageAllLocations && (
            <TabsTrigger value="control">System Control</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLocations.map(location => {
              const locationMetrics = getLocationMetrics(location.id);
              const canView = canViewLocationDetails(location.id);
              
              return (
                <Card key={location.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(location.status)}>
                          {location.status}
                        </Badge>
                        <Badge variant="secondary">{location.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {canView && locationMetrics ? (
                      <div className="space-y-4">
                        {/* Sales Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Today's Sales</p>
                            <p className="text-xl font-semibold">${locationMetrics.dailySales.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Transactions</p>
                            <p className="text-xl font-semibold">{locationMetrics.transactionCount}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Ticket</p>
                            <p className="text-lg font-medium">${locationMetrics.averageTicket.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Staff On Duty</p>
                            <p className="text-lg font-medium">{locationMetrics.staffOnDuty}/{location.staffing.maxCapacity}</p>
                          </div>
                        </div>

                        {/* System Status */}
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">System Status</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(locationMetrics.systemStatus.posSystem)}
                              <span className="text-sm">POS System</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(locationMetrics.systemStatus.paymentProcessor)}
                              <span className="text-sm">Payment</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(locationMetrics.systemStatus.printer)}
                              <span className="text-sm">Printer</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(locationMetrics.systemStatus.network)}
                              <span className="text-sm">Network</span>
                            </div>
                          </div>
                        </div>

                        {/* Alerts */}
                        {locationMetrics.alerts.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Active Alerts</p>
                            <div className="space-y-1">
                              {locationMetrics.alerts.slice(0, 2).map(alert => (
                                <div key={alert.id} className="flex items-center gap-2 text-sm">
                                  <AlertTriangle className={`h-3 w-3 ${
                                    alert.type === 'error' ? 'text-red-500' :
                                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                  }`} />
                                  <span className="truncate">{alert.message}</span>
                                </div>
                              ))}
                              {locationMetrics.alerts.length > 2 && (
                                <p className="text-xs text-muted-foreground">
                                  +{locationMetrics.alerts.length - 2} more alerts
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {canView ? 'Loading metrics...' : 'Access restricted'}
                        </p>
                      </div>
                    )}
                    
                    {canView && (
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {canManageLocation(location.id) && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Location Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed view with comprehensive analytics will be implemented here.
                This will include transaction history, staff performance, inventory levels, and more.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {canManageAllLocations && (
          <TabsContent value="control" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Control Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Executive system control panel for managing POS systems across all locations,
                  including remote reboots, configuration updates, and emergency controls.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}