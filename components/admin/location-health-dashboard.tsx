'use client';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

interface LocationMetrics {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  revenue: number;
  revenueChange: number;
  activeDevices: number;
  totalDevices: number;
  activeStaff: number;
  lastActivity: string;
}

export function LocationHealthDashboard() {
  const [locations] = useState<LocationMetrics[]>([
    {
      id: 'loc-1',
      name: 'Downtown Cafe',
      status: 'online',
      revenue: 2840,
      revenueChange: 12.5,
      activeDevices: 4,
      totalDevices: 5,
      activeStaff: 3,
      lastActivity: '2 min ago'
    },
    {
      id: 'loc-2',
      name: 'Mall Food Court',
      status: 'warning',
      revenue: 1920,
      revenueChange: -5.2,
      activeDevices: 3,
      totalDevices: 4,
      activeStaff: 2,
      lastActivity: '15 min ago'
    },
    {
      id: 'loc-3',
      name: 'Airport Terminal',
      status: 'online',
      revenue: 4120,
      revenueChange: 8.7,
      activeDevices: 6,
      totalDevices: 6,
      activeStaff: 5,
      lastActivity: '1 min ago'
    },
    {
      id: 'loc-4',
      name: 'University Campus',
      status: 'offline',
      revenue: 0,
      revenueChange: 0,
      activeDevices: 0,
      totalDevices: 3,
      activeStaff: 0,
      lastActivity: '2 hours ago'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <Activity className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const totalRevenue = locations.reduce((sum, loc) => sum + loc.revenue, 0);
  const onlineLocations = locations.filter(loc => loc.status === 'online').length;

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Location Health Monitor</h3>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          View Details
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Online Locations</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            {onlineLocations}/{locations.length}
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <div className="text-xl font-bold text-blue-700">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {locations.map((location) => (
          <div key={location.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(location.status)}
                <span className="font-medium text-sm">{location.name}</span>
              </div>
              <Badge variant={getStatusBadge(location.status) as any}>
                {location.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium">${location.revenue}</span>
                  {location.revenueChange !== 0 && (
                    <div className={`flex items-center gap-1 ${location.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {location.revenueChange > 0 ? 
                        <TrendingUp className="h-3 w-3" /> : 
                        <TrendingDown className="h-3 w-3" />
                      }
                      <span>{Math.abs(location.revenueChange)}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span className="text-muted-foreground">Devices:</span>
                  <span className="font-medium">{location.activeDevices}/{location.totalDevices}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-muted-foreground">Staff:</span>
                  <span className="font-medium">{location.activeStaff}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-muted-foreground">Last seen:</span>
                  <span className="font-medium">{location.lastActivity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}