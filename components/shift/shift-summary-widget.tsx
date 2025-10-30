'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  TrendingUp, 
  MapPin,
  ExternalLink,
  Activity,
  Timer
} from 'lucide-react';
import { Shift, WorkerSession } from '@/types/shift-management';
import Link from 'next/link';

interface ShiftSummaryWidgetProps {
  locationId: string;
  showActions?: boolean;
  className?: string;
}

export function ShiftSummaryWidget({ 
  locationId, 
  showActions = true, 
  className = '' 
}: ShiftSummaryWidgetProps) {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [workerSessions, setWorkerSessions] = useState<WorkerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchShiftSummary();
    const interval = setInterval(() => {
      fetchShiftSummary();
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [locationId]);

  const fetchShiftSummary = async () => {
    try {
      const [shiftResponse, sessionsResponse] = await Promise.all([
        fetch(`/api/shifts?locationId=${locationId}&status=ACTIVE`),
        fetch(`/api/worker-sessions?locationId=${locationId}&status=ACTIVE,ON_BREAK`)
      ]);

      if (shiftResponse.ok) {
        const shiftData = await shiftResponse.json();
        setCurrentShift(shiftData.shifts?.[0] || null);
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setWorkerSessions(sessionsData.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching shift summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftDuration = () => {
    if (!currentShift?.startTime) return '00:00';
    const start = new Date(currentShift.startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Activity className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Current Shift
          </CardTitle>
          {showActions && (
            <Link href={`/pos/shift-management?location=${locationId}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                Manage
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentShift ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{locationId}</span>
              </div>
              {getShiftStatusBadge(currentShift.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Duration</p>
                <p className="text-lg font-mono font-bold">{getShiftDuration()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Workers</p>
                <p className="text-lg font-bold">
                  {activeWorkers}/{totalWorkers}
                  {onBreakWorkers > 0 && (
                    <span className="text-sm text-yellow-600 ml-1">
                      ({onBreakWorkers} on break)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {currentShift.targetRevenue && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wide">Revenue Progress</span>
                  <span className="font-medium">
                    ${currentShift.actualRevenue?.toFixed(2) || '0.00'} / ${currentShift.targetRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${Math.min(((currentShift.actualRevenue || 0) / currentShift.targetRevenue) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(((currentShift.actualRevenue || 0) / currentShift.targetRevenue) * 100)}% of target
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Manager: {currentShift.managerName}</span>
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No active shift</p>
            {showActions && (
              <Link href={`/pos/shift-management?location=${locationId}`}>
                <Button size="sm" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Start Shift
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}