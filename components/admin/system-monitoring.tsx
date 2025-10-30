'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity,
  AlertCircle,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  location?: string;
}

export function SystemMonitoring() {
  const [alerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'High CPU usage detected on Kitchen Display #2',
      timestamp: '2 min ago',
      location: 'Downtown Location'
    },
    {
      id: '2',
      type: 'info',
      message: 'New device registration request',
      timestamp: '5 min ago',
      location: 'Mall Location'
    },
    {
      id: '3',
      type: 'error',
      message: 'Payment terminal offline',
      timestamp: '12 min ago',
      location: 'Airport Location'
    }
  ]);

  const [systemStats] = useState({
    activeUsers: 23,
    apiRequests: 1247,
    uptime: '99.9%',
    avgResponseTime: '120ms'
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">System Health Monitor</h3>
        </div>
        <Badge variant="outline" className="text-green-600">
          System Operational
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{systemStats.activeUsers}</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm">Uptime</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{systemStats.uptime}</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-muted rounded-lg p-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">API Requests</span>
            <div className="font-semibold">{systemStats.apiRequests}/hour</div>
          </div>
          <div>
            <span className="text-muted-foreground">Avg Response</span>
            <div className="font-semibold">{systemStats.avgResponseTime}</div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Recent Alerts</span>
          <Button variant="ghost" size="sm" className="text-xs h-6">
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-2 p-2 rounded border text-xs">
              {getAlertIcon(alert.type)}
              <div className="flex-1 space-y-1">
                <div className="font-medium">{alert.message}</div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{alert.timestamp}</span>
                  {alert.location && (
                    <>
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge variant={getAlertBadge(alert.type) as any} className="text-xs">
                {alert.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}