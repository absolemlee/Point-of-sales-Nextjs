'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Settings,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Shield,
  Activity,
  MapPin,
  User,
  Calendar,
  Wifi,
  WifiOff
} from 'lucide-react';

// Device Types and Status Enums
export enum DeviceType {
  CUSTOMER_KIOSK = 'CUSTOMER_KIOSK',
  MOBILE_POS = 'MOBILE_POS', 
  TABLET_POS = 'TABLET_POS',
  MANAGER_STATION = 'MANAGER_STATION'
}

export enum DeviceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  OFFLINE = 'OFFLINE'
}

export enum POSInterfaceType {
  CUSTOMER_ORDERING = 'CUSTOMER_ORDERING',
  PAYMENT_TERMINAL = 'PAYMENT_TERMINAL',
  KITCHEN_DISPLAY = 'KITCHEN_DISPLAY',
  MANAGER_TERMINAL = 'MANAGER_TERMINAL'
}

interface Device {
  id: string;
  fingerprint: string;
  deviceType: DeviceType;
  deviceName: string;
  status: DeviceStatus;
  locationId?: string;
  locationName?: string;
  lastSeen: Date;
  registeredAt: Date;
  approvedAt?: Date;
  capabilities: POSInterfaceType[];
  userAgent: string;
  ipAddress: string;
  registeredBy?: string;
  approvedBy?: string;
  sessions: {
    id: string;
    startedAt: Date;
    endedAt?: Date;
    isActive: boolean;
  }[];
}

interface DeviceFilters {
  status: DeviceStatus | 'ALL';
  deviceType: DeviceType | 'ALL';
  locationId: string | 'ALL';
  search: string;
}

export function DeviceManagementDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<DeviceFilters>({
    status: 'ALL',
    deviceType: 'ALL',
    locationId: 'ALL',
    search: ''
  });

  // Load devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.deviceType !== 'ALL') params.append('deviceType', filters.deviceType);
        if (filters.locationId !== 'ALL') params.append('locationId', filters.locationId);
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/admin/devices?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setDevices(data.devices.map((device: any) => ({
            ...device,
            lastSeen: new Date(device.lastSeen),
            registeredAt: new Date(device.registeredAt),
            approvedAt: device.approvedAt ? new Date(device.approvedAt) : undefined,
            sessions: device.sessions.map((session: any) => ({
              ...session,
              startedAt: new Date(session.startedAt),
              endedAt: session.endedAt ? new Date(session.endedAt) : undefined
            }))
          })));
        } else {
          console.error('Failed to fetch devices:', data.error);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [filters]);

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case DeviceType.CUSTOMER_KIOSK:
        return <Monitor className="h-4 w-4" />;
      case DeviceType.MOBILE_POS:
        return <Smartphone className="h-4 w-4" />;
      case DeviceType.TABLET_POS:
        return <Tablet className="h-4 w-4" />;
      case DeviceType.MANAGER_STATION:
        return <Settings className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: DeviceStatus) => {
    const variants: Record<DeviceStatus, { variant: any; icon: React.ReactNode }> = {
      [DeviceStatus.PENDING]: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      [DeviceStatus.APPROVED]: { variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      [DeviceStatus.REJECTED]: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
      [DeviceStatus.SUSPENDED]: { variant: 'secondary', icon: <AlertTriangle className="h-3 w-3" /> },
      [DeviceStatus.OFFLINE]: { variant: 'outline', icon: <WifiOff className="h-3 w-3" /> }
    };

    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  const handleApproveDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          approvedBy: 'admin@example.com' // TODO: Get from auth context
        })
      });

      const data = await response.json();
      if (data.success) {
        setDevices(devices.map(device => 
          device.id === deviceId 
            ? { ...data.device, 
                lastSeen: new Date(data.device.lastSeen),
                registeredAt: new Date(data.device.registeredAt),
                approvedAt: data.device.approvedAt ? new Date(data.device.approvedAt) : undefined
              }
            : device
        ));
        setShowApprovalDialog(false);
      } else {
        console.error('Failed to approve device:', data.error);
      }
    } catch (error) {
      console.error('Error approving device:', error);
    }
  };

  const handleRejectDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          approvedBy: 'admin@example.com', // TODO: Get from auth context
          reason: 'Device rejected by administrator'
        })
      });

      const data = await response.json();
      if (data.success) {
        setDevices(devices.map(device => 
          device.id === deviceId 
            ? { ...data.device,
                lastSeen: new Date(data.device.lastSeen),
                registeredAt: new Date(data.device.registeredAt),
                approvedAt: data.device.approvedAt ? new Date(data.device.approvedAt) : undefined
              }
            : device
        ));
        setShowApprovalDialog(false);
      } else {
        console.error('Failed to reject device:', data.error);
      }
    } catch (error) {
      console.error('Error rejecting device:', error);
    }
  };

  const handleSuspendDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suspend',
          approvedBy: 'admin@example.com', // TODO: Get from auth context
          reason: 'Device suspended by administrator'
        })
      });

      const data = await response.json();
      if (data.success) {
        setDevices(devices.map(device => 
          device.id === deviceId 
            ? { ...data.device,
                lastSeen: new Date(data.device.lastSeen),
                registeredAt: new Date(data.device.registeredAt),
                approvedAt: data.device.approvedAt ? new Date(data.device.approvedAt) : undefined
              }
            : device
        ));
      } else {
        console.error('Failed to suspend device:', data.error);
      }
    } catch (error) {
      console.error('Error suspending device:', error);
    }
  };

  const filteredDevices = devices.filter(device => {
    if (filters.status !== 'ALL' && device.status !== filters.status) return false;
    if (filters.deviceType !== 'ALL' && device.deviceType !== filters.deviceType) return false;
    if (filters.locationId !== 'ALL' && device.locationId !== filters.locationId) return false;
    if (filters.search && !device.deviceName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !device.fingerprint.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const pendingDevices = devices.filter(d => d.status === DeviceStatus.PENDING);
  const activeDevices = devices.filter(d => d.status === DeviceStatus.APPROVED);
  const onlineDevices = devices.filter(d => d.sessions.some(s => s.isActive));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Device Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all POS devices across your network
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Register New Device
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingDevices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeDevices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Online</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{onlineDevices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingDevices.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingDevices.length} device{pendingDevices.length > 1 ? 's' : ''} pending approval.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Devices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Device name or fingerprint..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value: any) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value={DeviceStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={DeviceStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={DeviceStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={DeviceStatus.SUSPENDED}>Suspended</SelectItem>
                  <SelectItem value={DeviceStatus.OFFLINE}>Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select value={filters.deviceType} onValueChange={(value: any) => setFilters({...filters, deviceType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value={DeviceType.CUSTOMER_KIOSK}>Customer Kiosk</SelectItem>
                  <SelectItem value={DeviceType.MOBILE_POS}>Mobile POS</SelectItem>
                  <SelectItem value={DeviceType.TABLET_POS}>Tablet POS</SelectItem>
                  <SelectItem value={DeviceType.MANAGER_STATION}>Manager Station</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={filters.locationId} onValueChange={(value) => setFilters({...filters, locationId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Locations</SelectItem>
                  <SelectItem value="loc-001">Main Store</SelectItem>
                  <SelectItem value="loc-002">Downtown Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Devices ({filteredDevices.length})</CardTitle>
          <CardDescription>
            Manage device registrations, approvals, and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading devices...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDevices.map((device) => (
                <div key={device.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.deviceType)}
                      <div>
                        <h3 className="font-semibold">{device.deviceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.fingerprint} • {device.deviceType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(device.status)}
                      {device.sessions.some(s => s.isActive) && (
                        <Badge variant="outline" className="text-green-600">
                          <Wifi className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{device.locationName || 'No location'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Registered {device.registeredAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-3 w-3" />
                      <span>Last seen {device.lastSeen.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-1">
                      {device.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>

                      {device.status === DeviceStatus.PENDING && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowApprovalDialog(true);
                          }}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      )}

                      {device.status === DeviceStatus.APPROVED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendDevice(device.id)}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredDevices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No devices found matching your filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Device Registration</DialogTitle>
            <DialogDescription>
              Review the device details and approve or reject the registration request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Device Name</Label>
                  <p className="text-sm">{selectedDevice.deviceName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Device Type</Label>
                  <p className="text-sm">{selectedDevice.deviceType.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fingerprint</Label>
                  <p className="text-sm font-mono">{selectedDevice.fingerprint}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm">{selectedDevice.ipAddress}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">User Agent</Label>
                  <p className="text-sm break-all">{selectedDevice.userAgent}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Registered By</Label>
                  <p className="text-sm">{selectedDevice.registeredBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Registration Time</Label>
                  <p className="text-sm">{selectedDevice.registeredAt.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Requested Capabilities</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDevice.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectDevice(selectedDevice.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleApproveDevice(selectedDevice.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Device Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Device Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected device.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Device overview content */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-medium">Basic Information</Label>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {selectedDevice.deviceName}</div>
                      <div><strong>Type:</strong> {selectedDevice.deviceType.replace('_', ' ')}</div>
                      <div><strong>Status:</strong> {selectedDevice.status}</div>
                      <div><strong>Location:</strong> {selectedDevice.locationName || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">Technical Details</Label>
                    <div className="space-y-1 text-sm">
                      <div><strong>Fingerprint:</strong> {selectedDevice.fingerprint}</div>
                      <div><strong>IP Address:</strong> {selectedDevice.ipAddress}</div>
                      <div><strong>Last Seen:</strong> {selectedDevice.lastSeen.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-medium">Active Sessions</Label>
                  {selectedDevice.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDevice.sessions.map((session) => (
                        <div key={session.id} className="border rounded p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">Session {session.id}</div>
                              <div className="text-sm text-muted-foreground">
                                Started: {session.startedAt.toLocaleString()}
                              </div>
                            </div>
                            <Badge variant={session.isActive ? "default" : "outline"}>
                              {session.isActive ? 'Active' : 'Ended'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active sessions</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Allowed Capabilities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedDevice.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline">
                          {capability.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Capabilities
                    </Button>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Device
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}