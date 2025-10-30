'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Play,
  Pause,
  Square,
  Settings,
  Monitor,
  ChefHat,
  CreditCard,
  UserCheck,
  Timer,
  DollarSign,
  Activity
} from 'lucide-react';
import { Shift, ShiftWorker, LocationPOSConfig, WorkerSession } from '@/types/shift-management';
import { ShiftWorkerSignIn } from '@/components/pos/shift-worker-signin';

interface ShiftDashboardProps {
  locationId: string;
  userRole?: string;
  userPermissions?: string[];
}

export function ShiftDashboard({ locationId, userRole = 'MANAGER', userPermissions = [] }: ShiftDashboardProps) {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [workerSessions, setWorkerSessions] = useState<WorkerSession[]>([]);
  const [locationConfig, setLocationConfig] = useState<LocationPOSConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchShiftData();
    const interval = setInterval(fetchShiftData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [locationId]);

  const fetchShiftData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [shiftResponse, sessionsResponse, configResponse] = await Promise.all([
        fetch(`/api/shifts?locationId=${locationId}&status=ACTIVE`),
        fetch(`/api/worker-sessions?locationId=${locationId}`),
        fetch(`/api/location-pos-config?locationId=${locationId}`)
      ]);

      // Handle shifts
      if (shiftResponse.ok) {
        const shiftData = await shiftResponse.json();
        setCurrentShift(shiftData.shifts?.[0] || null);
      }

      // Handle worker sessions
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setWorkerSessions(sessionsData.sessions || []);
      }

      // Handle location config
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setLocationConfig(configData.config || null);
      }

    } catch (error) {
      console.error('Error fetching shift data:', error);
      setError('Failed to load shift data');
    } finally {
      setLoading(false);
    }
  };

  const handleShiftAction = async (action: 'start' | 'pause' | 'resume' | 'close') => {
    try {
      const response = await fetch('/api/shifts', {
        method: currentShift ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(currentShift && { id: currentShift.id }),
          locationId,
          action,
          managerId: 'current-user-id', // Replace with actual user ID
          managerName: 'Current Manager' // Replace with actual user name
        })
      });

      if (response.ok) {
        await fetchShiftData();
      }
    } catch (error) {
      console.error('Error managing shift:', error);
      setError('Failed to update shift');
    }
  };

  const getShiftDuration = () => {
    if (!currentShift?.startTime) return '00:00:00';
    const start = new Date(currentShift.startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

  const getShiftStatusBadge = (status: string) => {
    const statusConfig = {
      'PLANNED': { variant: 'outline' as const, color: 'text-blue-600' },
      'ACTIVE': { variant: 'default' as const, color: 'text-green-600' },
      'PAUSED': { variant: 'secondary' as const, color: 'text-yellow-600' },
      'CLOSED': { variant: 'destructive' as const, color: 'text-red-600' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNED;
    return <Badge variant={config.variant} className={config.color}>{status}</Badge>;
  };

  const activeWorkers = workerSessions.filter(w => w.status === 'ACTIVE').length;
  const onBreakWorkers = workerSessions.filter(w => w.status === 'ON_BREAK').length;
  const totalWorkers = workerSessions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading shift data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Shift Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location: {locationId}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentShift ? getShiftDuration() : 'No Active Shift'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {totalWorkers} Workers ({activeWorkers} Active)
                </span>
              </div>
            </div>
            <div className="text-right space-y-2">
              {currentShift && getShiftStatusBadge(currentShift.status)}
              <div className="flex gap-2">
                {!currentShift ? (
                  <Button onClick={() => handleShiftAction('start')} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start Shift
                  </Button>
                ) : currentShift.status === 'ACTIVE' ? (
                  <>
                    <Button variant="outline" onClick={() => handleShiftAction('pause')} className="gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={() => handleShiftAction('close')} className="gap-2">
                      <Square className="h-4 w-4" />
                      Close Shift
                    </Button>
                  </>
                ) : currentShift.status === 'PAUSED' ? (
                  <>
                    <Button onClick={() => handleShiftAction('resume')} className="gap-2">
                      <Play className="h-4 w-4" />
                      Resume
                    </Button>
                    <Button variant="destructive" onClick={() => handleShiftAction('close')} className="gap-2">
                      <Square className="h-4 w-4" />
                      Close Shift
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="stations">POS Stations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Workers</p>
                    <p className="text-2xl font-bold">{activeWorkers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">On Break</p>
                    <p className="text-2xl font-bold">{onBreakWorkers}</p>
                  </div>
                  <Timer className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Shift Revenue</p>
                    <p className="text-2xl font-bold">${currentShift?.actualRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Progress</p>
                    <p className="text-2xl font-bold">
                      {currentShift?.targetRevenue ? 
                        Math.round(((currentShift.actualRevenue || 0) / currentShift.targetRevenue) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {currentShift?.targetRevenue && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: ${currentShift.actualRevenue?.toFixed(2) || '0.00'}</span>
                    <span>Target: ${currentShift.targetRevenue.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={((currentShift.actualRevenue || 0) / currentShift.targetRevenue) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <ShiftWorkerSignIn 
            locationId={locationId}
            onWorkerSignIn={() => fetchShiftData()}
            onWorkerSignOut={() => fetchShiftData()}
          />
        </TabsContent>

        <TabsContent value="stations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationConfig?.posStations.map((station) => (
              <Card key={station.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getStationIcon(station.type)}
                      <span className="font-medium">{station.name}</span>
                    </div>
                    <Badge variant={station.isActive ? 'default' : 'secondary'}>
                      {station.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  {station.assignedWorkerId && (
                    <div className="text-sm text-muted-foreground">
                      Assigned to: {workerSessions.find(w => w.workerId === station.assignedWorkerId)?.workerName || 'Unknown'}
                    </div>
                  )}
                  
                  {station.deviceInfo && (
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div>Screen: {station.deviceInfo.screenSize}</div>
                      <div>Last Activity: {new Date(station.deviceInfo.lastActivity).toLocaleTimeString()}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shift Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Performance metrics will be displayed here once orders start coming in.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}