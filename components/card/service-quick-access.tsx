'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HandHeart, MapPin, Users, TrendingUp, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export function ServiceExchangeQuickAccess() {
  const quickActions = [
    {
      title: 'Create Service',
      description: 'Define new service offerings',
      icon: <Plus className="h-5 w-5" />,
      href: '/services?tab=definitions',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      title: 'View Offers',
      description: 'Browse available service opportunities',
      icon: <HandHeart className="h-5 w-5" />,
      href: '/services?tab=offers',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Manage Locations',
      description: 'Configure location-specific services',
      icon: <MapPin className="h-5 w-5" />,
      href: '/locations',
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    },
    {
      title: 'Personnel Dashboard',
      description: 'Monitor associate performance',
      icon: <Users className="h-5 w-5" />,
      href: '/personnel',
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white'
    }
  ];

  const recentMetrics = [
    { label: 'Active Services', value: '12', trend: '+3', trendUp: true },
    { label: 'Completion Rate', value: '94%', trend: '+5%', trendUp: true },
    { label: 'Avg Response Time', value: '2.3h', trend: '-0.5h', trendUp: true },
    { label: 'Associate Rating', value: '4.8', trend: '+0.2', trendUp: true }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HandHeart className="h-6 w-6 text-blue-600" />
          Service Exchange Hub
        </CardTitle>
        <CardDescription>
          Quick access to service management and performance insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start gap-2 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span className="text-sm font-medium">{action.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground text-left">
                    {action.description}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Metrics */}
        <div>
          <h4 className="text-sm font-medium mb-3">Today's Performance</h4>
          <div className="grid grid-cols-2 gap-3">
            {recentMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="text-sm font-semibold">{metric.value}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    metric.trendUp 
                      ? 'text-green-600 border-green-200 bg-green-50' 
                      : 'text-red-600 border-red-200 bg-red-50'
                  }`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metric.trend}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">System Status</span>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              All Systems Operational
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}