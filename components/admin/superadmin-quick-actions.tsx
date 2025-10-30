'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Users,
  Shield,
  Database,
  Server,
  BarChart3,
  Bell,
  Key,
  ArrowRight,
  Plus
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  variant?: 'default' | 'secondary' | 'destructive';
}

export function SuperAdminQuickActions() {
  const [actions] = useState<QuickAction[]>([
    {
      title: 'Device Management',
      description: 'Approve, reject, or manage network devices',
      icon: <Shield className="h-5 w-5" />,
      href: '/admin/devices',
      badge: '3 pending',
      variant: 'destructive'
    },
    {
      title: 'User Administration',
      description: 'Manage user accounts and permissions',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      badge: 'new',
      variant: 'secondary'
    },
    {
      title: 'System Configuration',
      description: 'Configure system-wide settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/config'
    },
    {
      title: 'Database Management',
      description: 'Monitor and manage database operations',
      icon: <Database className="h-5 w-5" />,
      href: '/admin/database'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View network-wide analytics and reports',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/admin/analytics'
    },
    {
      title: 'API Monitoring',
      description: 'Monitor API performance and usage',
      icon: <Server className="h-5 w-5" />,
      href: '/admin/api'
    },
    {
      title: 'Security Center',
      description: 'Manage security policies and logs',
      icon: <Key className="h-5 w-5" />,
      href: '/admin/security'
    },
    {
      title: 'Notifications',
      description: 'Configure system notifications',
      icon: <Bell className="h-5 w-5" />,
      href: '/admin/notifications'
    }
  ]);

  const handleActionClick = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">SuperAdmin Controls</h3>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-auto p-3 flex flex-col items-start space-y-2 text-left hover:bg-muted/50 border border-transparent hover:border-border"
            onClick={() => handleActionClick(action.href)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {action.icon}
                <span className="font-medium text-sm">{action.title}</span>
              </div>
              {action.badge && (
                <Badge variant={action.variant || 'default'} className="text-xs">
                  {action.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-left">
              {action.description}
            </p>
            <ArrowRight className="h-3 w-3 text-muted-foreground self-end" />
          </Button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border">
        <div className="text-sm font-medium mb-2">Network Overview</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600">4</div>
            <div className="text-xs text-muted-foreground">Locations</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">18</div>
            <div className="text-xs text-muted-foreground">Devices</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">23</div>
            <div className="text-xs text-muted-foreground">Active Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}