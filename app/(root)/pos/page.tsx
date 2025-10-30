'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/auth/user-context';
import { KavaPRRole } from '@/schema/kavap-r-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  MapPin, 
  Users, 
  Settings,
  CreditCard,
  BarChart3,
  ShoppingCart,
  Store,
  Clock
} from 'lucide-react';

export default function POSPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Check if user can access multi-location dashboard
  const canAccessMultiLocation = user?.role === KavaPRRole.SUPERADMIN || 
                                 user?.role === KavaPRRole.FULLADMIN || 
                                 user?.role === KavaPRRole.ADMIN || 
                                 user?.role === KavaPRRole.MANAGER || 
                                 user?.role === KavaPRRole.OWNER;

  // Auto-redirect based on role and access level
  useEffect(() => {
    if (!loading && user) {
      // For executives and managers, default to multi-location view
      if (canAccessMultiLocation) {
        // Don't auto-redirect - show interface selection
        // router.push('/pos/multi-location');
      } else {
        // For other roles, default to terminal view  
        // router.push('/pos/terminal');
      }
    }
  }, [user, loading, canAccessMultiLocation, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CreditCard className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading POS System...</p>
        </div>
      </div>
    );
  }

  // Show interface selection instead of auto-redirect
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Point of Sale System</h1>
          <p className="text-muted-foreground">Select your POS interface or management dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Interfaces */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pos/customer-ordering')}>
            <CardHeader className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <CardTitle>Customer Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Self-service ordering interface for customers
              </p>
            </CardContent>
          </Card>

          {/* Kitchen Display */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pos/kitchen-display')}>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <CardTitle>Kitchen Display</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Order management for kitchen staff
              </p>
            </CardContent>
          </Card>

          {/* Payment Terminal */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pos/payment-terminal')}>
            <CardHeader className="text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <CardTitle>Payment Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Dedicated payment processing station
              </p>
            </CardContent>
          </Card>

          {/* Manager Terminal */}
          {canAccessMultiLocation && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pos/manager-terminal')}>
              <CardHeader className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <CardTitle>Manager Terminal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Management dashboard with full controls
                </p>
              </CardContent>
            </Card>
          )}

          {/* Multi-Location Dashboard */}
          {canAccessMultiLocation && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pos/multi-location')}>
              <CardHeader className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
                <CardTitle>Multi-Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Overview of all store locations
                </p>
              </CardContent>
            </Card>
          )}

          {/* Standard Terminal */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/pos/terminal')}>
            <CardHeader className="text-center">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <CardTitle>POS Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Smart interface selector based on your role
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => router.push('/pos/shift-management')}
            >
              <Clock className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Shift Management</div>
                <div className="text-sm text-muted-foreground">Sign in/out and manage shifts</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-16 justify-start"
              onClick={() => router.push('/analytics')}
            >
              <BarChart3 className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-muted-foreground">View sales and performance data</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access the POS system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Point of Sale System</h1>
        <p className="text-lg text-muted-foreground">
          Choose your POS interface
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Multi-Location Dashboard */}
        {canAccessMultiLocation && (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-blue-500" />
                Multi-Location Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comprehensive overview and management of all locations. 
                View real-time metrics, system status, and control multiple POS terminals.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  Real-time analytics across all locations
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4" />
                  System monitoring and alerts
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Staff and shift management
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4" />
                  Remote configuration and control
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => router.push('/pos/multi-location')}
              >
                Open Multi-Location Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* POS Terminal */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Monitor className="h-6 w-6 text-green-500" />
              POS Terminal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Full-featured point of sale terminal for processing transactions, 
              managing orders, and handling customer interactions.
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <ShoppingCart className="h-4 w-4" />
                Order processing and cart management
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4" />
                Payment processing (Cash, Card, Mobile)
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4" />
                Product catalog and inventory
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Customer management
              </div>
            </div>
            <Button 
              className="w-full" 
              variant={canAccessMultiLocation ? 'outline' : 'default'}
              onClick={() => router.push('/pos/terminal')}
            >
              Open POS Terminal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Role-based information */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Logged in as: <span className="font-medium">{user?.name}</span> ({user?.role})
        </p>
        {!canAccessMultiLocation && (
          <p className="text-xs text-muted-foreground mt-1">
            Contact your administrator for multi-location access
          </p>
        )}
      </div>
    </div>
  );
}