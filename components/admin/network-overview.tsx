'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  Eye,
  MoreHorizontal
} from 'lucide-react';

interface DeviceStatus {
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'MAINTENANCE';
  count: number;
}

export function NetworkOverview() {
  const [devices, setDevices] = useState<DeviceStatus[]>([
    { status: 'ACTIVE', count: 12 },
    { status: 'PENDING_APPROVAL', count: 3 },
    { status: 'MAINTENANCE', count: 1 },
    { status: 'INACTIVE', count: 2 },
    { status: 'REJECTED', count: 0 }
  ]);

  const [totalLocations] = useState(4);
  const [activeSessions] = useState(8);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'PENDING_APPROVAL': return 'bg-yellow-500';
      case 'MAINTENANCE': return 'bg-blue-500';
      case 'INACTIVE': return 'bg-gray-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING_APPROVAL': return <Clock className="h-4 w-4" />;
      case 'MAINTENANCE': return <Settings className="h-4 w-4" />;
      case 'INACTIVE': return <XCircle className="h-4 w-4" />;
      case 'REJECTED': return <AlertTriangle className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const totalDevices = devices.reduce((sum, device) => sum + device.count, 0);
  const pendingApprovals = devices.find(d => d.status === 'PENDING_APPROVAL')?.count || 0;

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Network Control Center</h3>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View All
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-blue-600">{totalDevices}</div>
          <div className="text-xs text-muted-foreground">Total Devices</div>
        </div>
        <div className="text-center p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-green-600">{totalLocations}</div>
          <div className="text-xs text-muted-foreground">Locations</div>
        </div>
        <div className="text-center p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold text-orange-600">{activeSessions}</div>
          <div className="text-xs text-muted-foreground">Active Sessions</div>
        </div>
      </div>

      {/* Device Status Breakdown */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Device Status Overview</div>
        {devices.filter(device => device.count > 0).map((device) => (
          <div key={device.status} className="flex items-center justify-between p-2 rounded border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
              <span className="text-sm">{device.status.replace('_', ' ')}</span>
              {getStatusIcon(device.status)}
            </div>
            <Badge variant={device.status === 'PENDING_APPROVAL' ? 'destructive' : 'secondary'}>
              {device.count}
            </Badge>
          </div>
        ))}
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {pendingApprovals} device{pendingApprovals > 1 ? 's' : ''} awaiting approval
            </span>
          </div>
          <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white">
            Review Pending
          </Button>
        </div>
      )}
    </div>
  );
}