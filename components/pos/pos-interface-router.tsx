'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/lib/auth/user-context';
import { KavaPRRole } from '@/schema/kavap-r-types';
import { useDeviceAuth } from '@/hooks/useDeviceAuth';
import { 
  POSInterfaceType, 
  POSAccess,
  getAvailableInterfaces, 
  canAccessInterface,
  POS_INTERFACE_CONFIGS 
} from '@/types/pos-interfaces';
import { CustomerOrderingInterface } from './customer-ordering-interface';
import { KitchenDisplayInterface } from './kitchen-display-interface';
import { PaymentTerminalInterface } from './payment-terminal-interface';
import { ManagerTerminalInterface } from './manager-terminal-interface';
import { 
  Monitor, 
  ChefHat, 
  CreditCard, 
  Shield, 
  Smartphone,
  Users,
  Package,
  Car,
  ShoppingCart,
  Coffee,
  Settings,
  ArrowLeft,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';

interface POSInterfaceRouterProps {
  locationId: string;
  forceInterface?: POSInterfaceType;
  mode?: 'kiosk' | 'mobile' | 'tablet' | 'desktop';
}

interface DeviceInfo {
  screenWidth: number;
  screenHeight: number;
  touchEnabled: boolean;
  userAgent: string;
}

export function POSInterfaceRouter({ locationId, forceInterface, mode = 'desktop' }: POSInterfaceRouterProps) {
  const { user, loading } = useUser();
  const { 
    isAuthenticated, 
    isAuthenticating, 
    device, 
    capabilities, 
    error: deviceError, 
    requiresApproval,
    allowedInterfaces: deviceAllowedInterfaces,
    authenticate,
    requestApproval,
    canAccessInterface: deviceCanAccess
  } = useDeviceAuth({ 
    locationId, 
    userId: user?.id,
    autoAuthenticate: true 
  });
  
  const [selectedInterface, setSelectedInterface] = useState<POSInterfaceType | null>(forceInterface || null);
  const [availableInterfaces, setAvailableInterfaces] = useState<POSInterfaceType[]>([]);
  const [workerSession, setWorkerSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchWorkerSession();
      determineAvailableInterfaces();
    }
  }, [user, locationId, isAuthenticated, deviceAllowedInterfaces]);

  const fetchWorkerSession = async () => {
    try {
      const response = await fetch(`/api/worker-sessions/current?locationId=${locationId}`);
      const data = await response.json();
      setWorkerSession(data.session);
    } catch (error) {
      console.error('Error fetching worker session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineAvailableInterfaces = () => {
    if (!user || !isAuthenticated) return;

    const userRole = user.role || KavaPRRole.WORKER;
    const permissions = user.permissions || [];
    const hasActiveSession = !!workerSession;

    // Intersect user-allowed interfaces with device-allowed interfaces
    const userAvailable = getAvailableInterfaces(userRole as string, permissions, capabilities);
    const deviceFiltered = userAvailable.filter(interfaceType => 
      deviceAllowedInterfaces.includes(interfaceType) || 
      deviceCanAccess(interfaceType)
    );
    
    setAvailableInterfaces(deviceFiltered);

    // Auto-select interface based on context
    if (forceInterface && deviceFiltered.includes(forceInterface)) {
      setSelectedInterface(forceInterface);
    } else if (deviceFiltered.length === 1) {
      setSelectedInterface(deviceFiltered[0]);
    } else if (!selectedInterface && deviceFiltered.length > 0) {
      // Default interface selection logic
      if (!user?.id) {
        // Guest user - default to customer ordering
        setSelectedInterface(POSInterfaceType.CUSTOMER_ORDERING);
      } else if ([KavaPRRole.MANAGER, KavaPRRole.OWNER, KavaPRRole.ADMIN, KavaPRRole.FULLADMIN, KavaPRRole.SUPERADMIN].includes(userRole)) {
        setSelectedInterface(POSInterfaceType.MANAGER_TERMINAL);
      } else if (hasActiveSession) {
        // Select based on worker's assigned station
        if (workerSession.assignedStations?.includes('KITCHEN')) {
          setSelectedInterface(POSInterfaceType.KITCHEN_DISPLAY);
        } else if (workerSession.assignedStations?.includes('PAYMENT')) {
          setSelectedInterface(POSInterfaceType.PAYMENT_TERMINAL);
        } else {
          setSelectedInterface(POSInterfaceType.ORDER_ENTRY);
        }
      }
    }
  };

  const getInterfaceIcon = (interfaceType: POSInterfaceType) => {
    switch (interfaceType) {
      case POSInterfaceType.CUSTOMER_ORDERING: return ShoppingCart;
      case POSInterfaceType.CUSTOMER_KIOSK: return Monitor;
      case POSInterfaceType.ORDER_ENTRY: return Coffee;
      case POSInterfaceType.KITCHEN_DISPLAY: return ChefHat;
      case POSInterfaceType.PAYMENT_TERMINAL: return CreditCard;
      case POSInterfaceType.MANAGER_TERMINAL: return Shield;
      case POSInterfaceType.DRIVE_THRU: return Car;
      case POSInterfaceType.MOBILE_POS: return Smartphone;
      case POSInterfaceType.INVENTORY_TERMINAL: return Package;
      default: return Monitor;
    }
  };

  const getInterfaceDescription = (interfaceType: POSInterfaceType) => {
    switch (interfaceType) {
      case POSInterfaceType.CUSTOMER_ORDERING:
        return 'Self-service ordering for customers';
      case POSInterfaceType.CUSTOMER_KIOSK:
        return 'Interactive kiosk for customer orders';
      case POSInterfaceType.ORDER_ENTRY:
        return 'Staff interface for taking customer orders';
      case POSInterfaceType.KITCHEN_DISPLAY:
        return 'Kitchen order management and tracking';
      case POSInterfaceType.PAYMENT_TERMINAL:
        return 'Dedicated payment processing station';
      case POSInterfaceType.MANAGER_TERMINAL:
        return 'Manager dashboard with full access';
      case POSInterfaceType.DRIVE_THRU:
        return 'Drive-through order processing';
      case POSInterfaceType.MOBILE_POS:
        return 'Mobile point-of-sale for servers';
      case POSInterfaceType.INVENTORY_TERMINAL:
        return 'Inventory management and stock control';
      default:
        return 'POS interface';
    }
  };

  const renderSelectedInterface = () => {
    if (!selectedInterface) return null;

    const commonProps = {
      locationId,
      workerId: workerSession?.workerId,
      stationId: workerSession?.assignedStations?.[0]
    };

    switch (selectedInterface) {
      case POSInterfaceType.CUSTOMER_ORDERING:
      case POSInterfaceType.CUSTOMER_KIOSK:
        return (
          <CustomerOrderingInterface 
            {...commonProps}
            mode={mode === 'kiosk' ? 'kiosk' : 'mobile'}
          />
        );
      
      case POSInterfaceType.KITCHEN_DISPLAY:
        return <KitchenDisplayInterface {...commonProps} />;
      
      case POSInterfaceType.PAYMENT_TERMINAL:
        return <PaymentTerminalInterface {...commonProps} />;
      
      case POSInterfaceType.MANAGER_TERMINAL:
        return (
          <ManagerTerminalInterface 
            locationId={locationId}
            managerId={user?.id || ''}
          />
        );
      
      // TODO: Implement other interfaces
      case POSInterfaceType.ORDER_ENTRY:
        return <CustomerOrderingInterface {...commonProps} mode="tablet" />;
      
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>Interface not yet implemented</p>
              <Button 
                onClick={() => setSelectedInterface(null)}
                className="mt-4"
              >
                Back to Selection
              </Button>
            </div>
          </div>
        );
    }
  };

  if (loading || isLoading || isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Monitor className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading POS interface...</p>
          {isAuthenticating && <p className="text-sm text-muted-foreground">Authenticating device...</p>}
        </div>
      </div>
    );
  }

  // Show device authentication error
  if (!isAuthenticated && deviceError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Device Authentication Required</h2>
          <p className="text-muted-foreground mb-6">{deviceError}</p>
          
          {requiresApproval ? (
            <div className="space-y-4">
              <p className="text-sm">This device requires administrator approval to access POS interfaces.</p>
              <Button onClick={requestApproval}>
                Request Approval
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={() => authenticate()}>
                Retry Authentication
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Go to Dashboard
              </Button>
            </div>
          )}
          
          {device && (
            <div className="mt-6 p-4 bg-muted rounded-lg text-left">
              <h4 className="font-medium mb-2">Device Information</h4>
              <div className="text-sm space-y-1">
                <div>Name: {device.deviceName}</div>
                <div>Type: {device.deviceType}</div>
                <div>Status: {device.status}</div>
                {capabilities && (
                  <div>Screen: {capabilities.screenWidth}x{capabilities.screenHeight}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show interface selection if no interface is selected
  if (!selectedInterface) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Select POS Interface</h1>
                <p className="text-muted-foreground">Choose your point-of-sale interface for {locationId}</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {user.name || user.id}
                </div>
                <Badge variant="outline">{user.role}</Badge>
                {workerSession && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Active Session
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interface Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableInterfaces.map((interfaceType) => {
              const config = POS_INTERFACE_CONFIGS[interfaceType];
              const Icon = getInterfaceIcon(interfaceType);
              
              return (
                <Card 
                  key={interfaceType}
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50"
                  onClick={() => setSelectedInterface(interfaceType)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-3">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {interfaceType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {getInterfaceDescription(interfaceType)}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Access Level:</span>
                        <Badge variant="outline" className="text-xs">
                          {config.accessLevel.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      
                      {config.requiredPermissions.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Permissions: {config.requiredPermissions.slice(0, 2).join(', ')}
                          {config.requiredPermissions.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {availableInterfaces.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Interfaces Available</h3>
              <p className="text-muted-foreground">
                You don't have access to any POS interfaces at this location.
                {!workerSession && ' Please sign in to a shift first.'}
              </p>
              {!workerSession && (
                <Button 
                  className="mt-4"
                  onClick={() => window.location.href = '/pos/shift-management'}
                >
                  Go to Shift Management
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the selected interface with a back button
  return (
    <div className="relative">
      {/* Back Button (only show if not forced) */}
      {!forceInterface && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-50"
          onClick={() => setSelectedInterface(null)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Selection
        </Button>
      )}
      
      {renderSelectedInterface()}
    </div>
  );
}