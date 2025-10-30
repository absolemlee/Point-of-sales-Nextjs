'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  MapPin, 
  Users, 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  AlertCircle,
  CheckCircle,
  Monitor,
  ChefHat,
  CreditCard,
  Settings
} from 'lucide-react';
import { WorkerSession, LocationPOSConfig } from '@/types/shift-management';

interface ShiftWorkerSignInProps {
  locationId: string;
  onWorkerSignIn?: (session: WorkerSession) => void;
  onWorkerSignOut?: (workerId: string) => void;
}

export function ShiftWorkerSignIn({ locationId, onWorkerSignIn, onWorkerSignOut }: ShiftWorkerSignInProps) {
  const [workers, setWorkers] = useState<WorkerSession[]>([]);
  const [locationConfig, setLocationConfig] = useState<LocationPOSConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInMode, setSignInMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sign-in form state
  const [workerId, setWorkerId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [role, setRole] = useState<string>('');
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  useEffect(() => {
    fetchLocationData();
    const interval = setInterval(fetchLocationData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [locationId]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      
      const [configResponse, sessionsResponse] = await Promise.all([
        fetch(`/api/location-pos-config?locationId=${locationId}&includeSessions=true`),
        fetch(`/api/worker-sessions?locationId=${locationId}`)
      ]);

      if (configResponse.ok) {
        const configData = await configResponse.json();
        setLocationConfig(configData.config);
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setWorkers(sessionsData.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      setError('Failed to load location data');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSignIn = async () => {
    if (!workerId || !workerName || !role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/worker-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-in',
          workerId,
          workerName,
          shiftId: locationConfig?.activeShiftId,
          locationId,
          role,
          assignedStations: selectedStations,
          permissions: getRolePermissions(role),
          deviceInfo: {
            userAgent: navigator.userAgent,
            ipAddress: 'auto-detected',
            screenSize: `${screen.width}x${screen.height}`
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Worker signed in successfully!');
        setSignInMode(false);
        setWorkerId('');
        setWorkerName('');
        setRole('');
        setSelectedStations([]);
        fetchLocationData();
        onWorkerSignIn?.(data.session);
      } else {
        setError(data.error || 'Sign-in failed');
      }
    } catch (error) {
      setError('Network error during sign-in');
    }
  };

  const handleWorkerSignOut = async (workerId: string) => {
    try {
      setError(null);
      const response = await fetch('/api/worker-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-out',
          workerId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Worker signed out successfully!');
        fetchLocationData();
        onWorkerSignOut?.(workerId);
      } else {
        setError(data.error || 'Sign-out failed');
      }
    } catch (error) {
      setError('Network error during sign-out');
    }
  };

  const handleBreakToggle = async (workerId: string, currentStatus: string) => {
    try {
      setError(null);
      const action = currentStatus === 'ACTIVE' ? 'break-start' : 'break-end';
      const response = await fetch('/api/worker-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          workerId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(data.message);
        fetchLocationData();
      } else {
        setError(data.error || 'Break toggle failed');
      }
    } catch (error) {
      setError('Network error during break toggle');
    }
  };

  const getRolePermissions = (role: string): string[] => {
    const permissionMap: Record<string, string[]> = {
      'MANAGER': ['pos:operate', 'pos:admin', 'payment:process', 'orders:manage', 'inventory:admin', 'reports:view'],
      'CASHIER': ['pos:operate', 'payment:process', 'orders:manage'],
      'KITCHEN': ['kitchen:operate', 'orders:prepare', 'inventory:update'],
      'SERVER': ['orders:serve', 'customer:assist', 'tables:manage'],
      'CLEANER': ['maintenance:log', 'inventory:supplies']
    };
    return permissionMap[role] || [];
  };

  const getStationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_ENTRY': return <Monitor className="h-4 w-4" />;
      case 'KITCHEN_DISPLAY': return <ChefHat className="h-4 w-4" />;
      case 'PAYMENT': return <CreditCard className="h-4 w-4" />;
      case 'MANAGER': return <Settings className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'ON_BREAK': return 'bg-yellow-500';
      case 'INACTIVE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading shift information...</p>
        </div>
      </div>
    );
  }

  const activeWorkers = workers.filter(w => w.status === 'ACTIVE');
  const onBreakWorkers = workers.filter(w => w.status === 'ON_BREAK');
  const availableStations = locationConfig?.posStations.filter(s => s.isActive && !s.assignedWorkerId) || [];

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MapPin className="h-6 w-6" />
            Shift Management - {locationConfig?.locationId || locationId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeWorkers.length}</p>
              <p className="text-sm text-muted-foreground">Active Workers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{onBreakWorkers.length}</p>
              <p className="text-sm text-muted-foreground">On Break</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{availableStations.length}</p>
              <p className="text-sm text-muted-foreground">Available Stations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Sign-In Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Worker Sign-In
              </span>
              <Button
                variant={signInMode ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  setSignInMode(!signInMode);
                  setError(null);
                  setSuccess(null);
                }}
              >
                {signInMode ? 'Cancel' : 'New Sign-In'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signInMode ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workerId">Worker ID</Label>
                  <Input
                    id="workerId"
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    placeholder="Enter worker ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="workerName">Worker Name</Label>
                  <Input
                    id="workerName"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="CASHIER">Cashier</SelectItem>
                      <SelectItem value="KITCHEN">Kitchen Staff</SelectItem>
                      <SelectItem value="SERVER">Server</SelectItem>
                      <SelectItem value="CLEANER">Cleaner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {availableStations.length > 0 && (
                  <div>
                    <Label>Assign Stations (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableStations.map(station => (
                        <label key={station.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStations.includes(station.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStations([...selectedStations, station.id]);
                              } else {
                                setSelectedStations(selectedStations.filter(s => s !== station.id));
                              }
                            }}
                          />
                          <div className="flex items-center gap-1 text-sm">
                            {getStationIcon(station.type)}
                            {station.name}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button onClick={handleWorkerSignIn} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In Worker
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click "New Sign-In" to sign in a worker for this shift
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Workers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Workers ({workers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workers.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No workers signed in yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workers.map(worker => (
                  <div key={worker.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{worker.workerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {worker.role} • Signed in {new Date(worker.clockInTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(worker.status)}>
                        {worker.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {worker.assignedStations.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Assigned Stations:</p>
                        <div className="flex gap-1 flex-wrap">
                          {worker.assignedStations.map(stationId => {
                            const station = locationConfig?.posStations.find(s => s.id === stationId);
                            return (
                              <Badge key={stationId} variant="outline" className="text-xs">
                                {getStationIcon(station?.type || 'ORDER_ENTRY')}
                                <span className="ml-1">{station?.name || stationId}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBreakToggle(worker.workerId, worker.status)}
                        disabled={worker.status === 'INACTIVE'}
                      >
                        <Coffee className="h-3 w-3 mr-1" />
                        {worker.status === 'ACTIVE' ? 'Start Break' : 'End Break'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleWorkerSignOut(worker.workerId)}
                        disabled={worker.status === 'INACTIVE'}
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}