'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  Pause,
  User,
  MapPin,
  Timer
} from 'lucide-react';
import { WorkerSession } from '@/types/shift-management';
import { useUser } from '@/lib/auth/user-context';

interface QuickWorkerStatusProps {
  locationId: string;
  compact?: boolean;
  onStatusChange?: (session: WorkerSession | null) => void;
}

export function QuickWorkerStatus({ locationId, compact = false, onStatusChange }: QuickWorkerStatusProps) {
  const { user } = useUser();
  const [workerSession, setWorkerSession] = useState<WorkerSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      checkWorkerSession();
      const interval = setInterval(checkWorkerSession, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id, locationId]);

  const checkWorkerSession = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/worker-sessions?workerId=${user.id}&locationId=${locationId}`);
      if (response.ok) {
        const data = await response.json();
        const activeSession = data.sessions?.find((s: WorkerSession) => s.status !== 'INACTIVE');
        setWorkerSession(activeSession || null);
        onStatusChange?.(activeSession || null);
      }
    } catch (error) {
      console.error('Error checking worker session:', error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/worker-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-in',
          workerId: user?.id,
          workerName: user?.name || 'Unknown Worker',
          locationId,
          role: user?.role || 'WORKER',
          assignedStations: [], // Will be assigned by manager
          permissions: [],
          deviceInfo: {
            userAgent: navigator.userAgent,
            ipAddress: 'auto-detected',
            screenSize: `${screen.width}x${screen.height}`
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkerSession(data.session);
        onStatusChange?.(data.session);
      } else {
        setError(data.error || 'Clock-in failed');
      }
    } catch (error) {
      setError('Network error during clock-in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/worker-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock-out',
          workerId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkerSession(null);
        onStatusChange?.(null);
      } else {
        setError(data.error || 'Clock-out failed');
      }
    } catch (error) {
      setError('Network error during clock-out');
    } finally {
      setLoading(false);
    }
  };

  const handleBreakToggle = async () => {
    if (!workerSession) return;

    setLoading(true);
    setError(null);

    try {
      const action = workerSession.status === 'ACTIVE' ? 'break-start' : 'break-end';
      const response = await fetch('/api/worker-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          workerId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        await checkWorkerSession(); // Refresh status
      } else {
        setError(data.error || 'Break toggle failed');
      }
    } catch (error) {
      setError('Network error during break toggle');
    } finally {
      setLoading(false);
    }
  };

  const getSessionDuration = () => {
    if (!workerSession?.clockInTime) return '00:00';
    const start = new Date(workerSession.clockInTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    if (!workerSession) return null;
    
    const statusConfig = {
      'ACTIVE': { variant: 'default' as const, color: 'bg-green-500', text: 'Working' },
      'ON_BREAK': { variant: 'secondary' as const, color: 'bg-yellow-500', text: 'On Break' },
      'INACTIVE': { variant: 'outline' as const, color: 'bg-gray-500', text: 'Clocked Out' }
    };
    
    const config = statusConfig[workerSession.status] || statusConfig.INACTIVE;
    return (
      <Badge variant={config.variant} className="gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.text}
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                <AvatarFallback>
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                {workerSession && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {getSessionDuration()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {!workerSession ? (
                <Button size="sm" onClick={handleClockIn} disabled={loading} className="gap-1">
                  <LogIn className="h-3 w-3" />
                  Clock In
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleBreakToggle} 
                    disabled={loading}
                    className="gap-1"
                  >
                    {workerSession.status === 'ACTIVE' ? (
                      <>
                        <Coffee className="h-3 w-3" />
                        Break
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleClockOut} 
                    disabled={loading}
                    className="gap-1"
                  >
                    <LogOut className="h-3 w-3" />
                    Out
                  </Button>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="text-xs text-red-500 mt-2">{error}</div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Worker Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
              <AvatarFallback>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationId}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {workerSession && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Session Duration:</span>
              <span className="font-mono">{getSessionDuration()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Clock In Time:</span>
              <span>{new Date(workerSession.clockInTime).toLocaleTimeString()}</span>
            </div>
            {workerSession.assignedStations.length > 0 && (
              <div className="flex justify-between text-sm">
                <span>Assigned Stations:</span>
                <span>{workerSession.assignedStations.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!workerSession ? (
            <Button onClick={handleClockIn} disabled={loading} className="flex-1 gap-2">
              <LogIn className="h-4 w-4" />
              Clock In to Shift
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleBreakToggle} 
                disabled={loading}
                className="flex-1 gap-2"
              >
                {workerSession.status === 'ACTIVE' ? (
                  <>
                    <Coffee className="h-4 w-4" />
                    Start Break
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    End Break
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClockOut} 
                disabled={loading}
                className="flex-1 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Clock Out
              </Button>
            </>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}