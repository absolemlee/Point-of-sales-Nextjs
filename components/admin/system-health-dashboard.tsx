'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Server, 
  Database, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    name: string;
    status: 'online' | 'offline' | 'degraded';
    uptime: string;
    lastCheck: string;
  }[];
  alerts: {
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }[];
}

export function SystemHealthDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    services: [
      { name: 'API Gateway', status: 'online', uptime: '99.9%', lastCheck: '2 min ago' },
      { name: 'Database Cluster', status: 'online', uptime: '99.8%', lastCheck: '1 min ago' },
      { name: 'Auth Service', status: 'online', uptime: '100%', lastCheck: '30 sec ago' },
      { name: 'Payment Gateway', status: 'degraded', uptime: '98.2%', lastCheck: '3 min ago' },
      { name: 'Backup System', status: 'online', uptime: '99.5%', lastCheck: '5 min ago' },
    ],
    alerts: [
      { level: 'warning', message: 'Payment gateway experiencing elevated response times', timestamp: '5 min ago' },
      { level: 'info', message: 'Scheduled maintenance window: Sunday 2AM-4AM', timestamp: '1 hour ago' },
    ]
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">System Health</CardTitle>
          </div>
          <Badge 
            variant={systemHealth.status === 'healthy' ? 'default' : 'destructive'}
            className="capitalize"
          >
            {systemHealth.status}
          </Badge>
        </div>
        <CardDescription>
          Network infrastructure and service monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Services Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Core Services</h4>
          <div className="space-y-2">
            {systemHealth.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {service.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{service.lastCheck}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        {systemHealth.alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Alerts</h4>
            <div className="space-y-1">
              {systemHealth.alerts.slice(0, 2).map((alert, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 rounded border-l-2 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}