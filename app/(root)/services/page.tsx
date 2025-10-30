'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ServiceDashboard from '@/components/services/service-dashboard';
import LocationServiceOffering from '@/components/services/location-service-offering';
import AssociateServiceAcceptance from '@/components/services/associate-service-acceptance';

export default function ServicesPage() {
  // Mock user data - in real implementation, get from auth context
  const userRole: 'LOCATION_MANAGER' | 'CENTRAL_OPERATIONS' | 'ASSOCIATE' | 'SYSTEM_ADMIN' = 'SYSTEM_ADMIN';
  const userId = 'user-123';
  const userName = 'System Admin';
  const locationId = 'loc-456';
  const locationName = 'Main Location';
  const associateId = 'assoc-789';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeOffers: 0,
    activeAgreements: 0,
    totalEarnings: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    // Simulate loading stats - in real implementation, fetch from API
    setTimeout(() => {
      setStats({
        totalServices: 25,
        activeOffers: 12,
        activeAgreements: 8,
        totalEarnings: 2450,
        pendingApprovals: 3
      });
      setLoading(false);
    }, 1000);
  }, []);

  const renderUserSpecificContent = () => {
    if (userRole === 'SYSTEM_ADMIN' || userRole === 'CENTRAL_OPERATIONS') {
      return (
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Service Management</TabsTrigger>
            <TabsTrigger value="offers">All Offers</TabsTrigger>
            <TabsTrigger value="agreements">All Agreements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
            
            <TabsContent value="services">
              <ServiceDashboard />
            </TabsContent>
            
            <TabsContent value="offers">
              <Card>
                <CardHeader>
                  <CardTitle>All Service Offers</CardTitle>
                  <CardDescription>
                    Overview of all service offers across all locations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Multi-location service offer management interface would go here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="agreements">
              <Card>
                <CardHeader>
                  <CardTitle>All Service Agreements</CardTitle>
                  <CardDescription>
                    Overview of all service agreements across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Organization-wide service agreement management interface would go here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Service Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics and insights for the service exchange system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analytics dashboard would go here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );
    } else if (userRole === 'LOCATION_MANAGER') {
      if (!locationId || !locationName) {
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Location Information Missing</h3>
              <p className="text-muted-foreground">
                Location details are required to access service offerings.
              </p>
            </CardContent>
          </Card>
        );
      }
        
        return (
          <Tabs defaultValue="offerings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="offerings">Service Offerings</TabsTrigger>
              <TabsTrigger value="services">Browse Services</TabsTrigger>
              <TabsTrigger value="agreements">Active Agreements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="offerings">
              <LocationServiceOffering 
                locationId={locationId}
                locationName={locationName}
                userRole={userRole}
              />
            </TabsContent>
            
            <TabsContent value="services">
              <ServiceDashboard />
            </TabsContent>
            
            <TabsContent value="agreements">
              <Card>
                <CardHeader>
                  <CardTitle>Location Service Agreements</CardTitle>
                  <CardDescription>
                    Manage active service agreements for {locationName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Location-specific service agreement management interface would go here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        );
    } else if (userRole === 'ASSOCIATE') {
      if (!associateId) {
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Associate Information Missing</h3>
              <p className="text-muted-foreground">
                Associate details are required to access service opportunities.
              </p>
            </CardContent>
          </Card>
        );
      }
      
      return (
        <AssociateServiceAcceptance 
          associateId={associateId}
          associateName={userName}
        />
      );
    } else {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">
              Your user role does not have access to the service exchange system.
            </p>
          </CardContent>
        </Card>
      );
    }
  };

  const getStatsForRole = () => {
    if (userRole === 'SYSTEM_ADMIN' || userRole === 'CENTRAL_OPERATIONS') {
      return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                    <p className="text-2xl font-bold">{stats.totalServices}</p>
                  </div>
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Offers</p>
                    <p className="text-2xl font-bold">{stats.activeOffers}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Agreements</p>
                    <p className="text-2xl font-bold">{stats.activeAgreements}</p>
                  </div>
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  </div>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
    } else if (userRole === 'LOCATION_MANAGER') {
      return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">My Offers</p>
                    <p className="text-2xl font-bold">{stats.activeOffers}</p>
                  </div>
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Services</p>
                    <p className="text-2xl font-bold">{stats.activeAgreements}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                  </div>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  </div>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
    } else if (userRole === 'ASSOCIATE') {
      return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Offers</p>
                    <p className="text-2xl font-bold">{stats.activeOffers}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">My Services</p>
                    <p className="text-2xl font-bold">{stats.activeAgreements}</p>
                  </div>
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                  </div>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  </div>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
    } else {
      return null;
    }
  };

  const getPageTitle = () => {
    if (userRole === 'SYSTEM_ADMIN') {
      return 'Service Management System';
    } else if (userRole === 'CENTRAL_OPERATIONS') {
      return 'Service Operations Overview';
    } else if (userRole === 'LOCATION_MANAGER') {
      return `Service Management - ${locationName || 'Location'}`;
    } else if (userRole === 'ASSOCIATE') {
      return 'Service Opportunities';
    } else {
      return 'Service Exchange';
    }
  };

  const getPageDescription = () => {
    if (userRole === 'SYSTEM_ADMIN') {
      return 'Manage service definitions, monitor system-wide performance, and configure service exchange settings.';
    } else if (userRole === 'CENTRAL_OPERATIONS') {
      return 'Monitor service exchange activities across all locations and manage organizational service policies.';
    } else if (userRole === 'LOCATION_MANAGER') {
      return 'Create service offers, manage agreements, and coordinate with associates for your location\'s needs.';
    } else if (userRole === 'ASSOCIATE') {
      return 'Browse available service opportunities, manage your commitments, and track your earnings.';
    } else {
      return 'Project-based service exchange system replacing hourly rates with defined service offerings.';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground max-w-3xl">
            {getPageDescription()}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {userRole.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {locationName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {getStatsForRole()}

      {/* System Status Banner */}
      <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Service Exchange System Active
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Project-based service system is operational. Associates can now accept service offers instead of hourly work.
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {renderUserSpecificContent()}
    </div>
  );
}