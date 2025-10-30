'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  Database, 
  CreditCard, 
  Printer, 
  CheckCircle, 
  AlertCircle,
  XCircle
} from 'lucide-react';

interface SystemStatus {
  component: string;
  status: 'online' | 'warning' | 'offline';
  icon: React.ReactNode;
  details: string;
  uptime?: number;
}

const systemComponents: SystemStatus[] = [
  {
    component: 'Network',
    status: 'online',
    icon: <Wifi className="h-4 w-4" />,
    details: 'Connected - 45ms',
    uptime: 99.8
  },
  {
    component: 'Database',
    status: 'online', 
    icon: <Database className="h-4 w-4" />,
    details: 'Synced - 2s ago',
    uptime: 99.9
  },
  {
    component: 'Payment',
    status: 'warning',
    icon: <CreditCard className="h-4 w-4" />,
    details: 'Card reader needs calibration',
    uptime: 97.2
  },
  {
    component: 'Receipt Printer',
    status: 'online',
    icon: <Printer className="h-4 w-4" />,
    details: 'Ready - Paper: 78%',
    uptime: 95.4
  }
];

export function POSSystemStatus() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'warning': return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'offline': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return <CheckCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const overallStatus = systemComponents.every(c => c.status === 'online') ? 'online' : 
                      systemComponents.some(c => c.status === 'offline') ? 'offline' : 'warning';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">System Status</h3>
          <p className="text-sm text-gray-600">POS infrastructure monitoring</p>
        </div>
        <Badge className={`${getStatusColor(overallStatus)} border`}>
          {getStatusIcon(overallStatus)}
          <span className="ml-1 capitalize">{overallStatus}</span>
        </Badge>
      </div>

      <div className="space-y-3">
        {systemComponents.map((component, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                component.status === 'online' ? 'bg-green-50' :
                component.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <div className={
                  component.status === 'online' ? 'text-green-600' :
                  component.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }>
                  {component.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{component.component}</div>
                <div className="text-xs text-gray-500">{component.details}</div>
                {component.uptime && (
                  <div className="mt-1">
                    <div className="flex items-center space-x-2">
                      <Progress value={component.uptime} className="w-16 h-1" />
                      <span className="text-xs text-gray-400">{component.uptime}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              {getStatusIcon(component.status)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">All systems operational</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Last maintenance check: 2 hours ago
        </p>
      </div>
    </div>
  );
}