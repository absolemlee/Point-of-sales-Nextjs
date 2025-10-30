'use client';
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HandHeart, 
  MapPin, 
  Users, 
  Plus, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';

export function QuickAccessPanel() {
  const quickActions = [
    {
      title: 'Create Service',
      description: 'Define a new service offering',
      icon: <HandHeart className="h-5 w-5" />,
      href: '/services?action=create',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      urgent: false
    },
    {
      title: 'Browse Services',
      description: 'View available services',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/services',
      color: 'bg-green-50 text-green-600 border-green-200',
      urgent: false
    },
    {
      title: 'Manage Locations',
      description: 'Configure location settings',
      icon: <MapPin className="h-5 w-5" />,
      href: '/locations',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      urgent: false
    },
    {
      title: 'Personnel Hub',
      description: 'Associate management',
      icon: <Users className="h-5 w-5" />,
      href: '/personnel',
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      urgent: false
    }
  ];

  const systemStatus = {
    activeServices: 8,
    pendingOffers: 3,
    completedToday: 12,
    onlineAssociates: 15
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Quick Actions
          </span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            System Active
          </Badge>
        </CardTitle>
        <CardDescription>
          Access key service exchange functions and monitor system status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="group p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* System Status */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            System Status
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Active Services</span>
              <Badge variant="secondary">{systemStatus.activeServices}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Pending Offers</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {systemStatus.pendingOffers}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Completed Today</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {systemStatus.completedToday}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Online Associates</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {systemStatus.onlineAssociates}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/analytics">
              View Full Analytics Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}