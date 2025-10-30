/**
 * Location-Centered Management Interface
 * Provides appropriate access based on user type:
 * - Location Managers: Full authority over their assigned location(s)
 * - Central Operations: Multi-location oversight and coordination
 * - Associates: Service-related access to their assigned locations
 * - System Admin: Technical administration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CentralOperationsDashboard } from '@/components/central/central-operations-dashboard';
import { 
  MapPin, 
  Users, 
  Settings, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Calendar,
  DollarSign,
  Package,
  Shield,
  Eye,
  Edit,
  Plus,
  Building
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface UserAccount {
  id: string;
  username: string;
  email: string;
  userType: 'LOCATION_MANAGER' | 'CENTRAL_OPERATIONS' | 'ASSOCIATE' | 'SYSTEM_ADMIN' | 'REGIONAL_MANAGER';
  displayName: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'PENDING';
}

interface LocationAccess {
  locationId: string;
  locationName: string;
  isPrimaryManager: boolean;
  locationManagementAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  personnelManagementAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  roleDeclarationAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  financialAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  canHireAssociates: boolean;
  canApproveAgreements: boolean;
}

interface LocationOperationalStatus {
  locationId: string;
  locationName: string;
  operationalStatus: 'OPERATIONAL' | 'LIMITED_SERVICE' | 'MAINTENANCE' | 'EMERGENCY' | 'SEASONAL_CLOSED';
  currentStaffCount: number;
  minimumStaffRequired: number;
  optimalStaffCount: number;
  availableServices: string[];
  temporarilyUnavailableServices: string[];
  dailyCapacityPercentage: number;
  serviceQualityScore: number;
  statusNotes?: string;
  lastStatusUpdate: string;
}

interface RoleDeclaration {
  id: string;
  locationId: string;
  roleType: 'KAVATENDER' | 'KAVARISTA' | 'HOST';
  positionsNeeded: number;
  priorityLevel: number;
  hourlyRateMin: number;
  hourlyRateMax: number;
  declarationStatus: 'ACTIVE' | 'FILLED' | 'SUSPENDED' | 'CANCELLED';
  declaredBy: string;
  createdAt: string;
}

// ============================================
// MOCK DATA (Replace with actual API calls)
// ============================================

const mockCurrentUser: UserAccount = {
  id: 'usr_loc_main',
  username: 'main.manager',
  email: 'main.manager@kavapr.com',
  userType: 'LOCATION_MANAGER',
  displayName: 'Main Store Manager',
  accountStatus: 'ACTIVE'
};

const mockLocationAccess: LocationAccess[] = [
  {
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    isPrimaryManager: true,
    locationManagementAccess: 'FULL',
    personnelManagementAccess: 'FULL',
    roleDeclarationAccess: 'FULL',
    financialAccess: 'MODIFY',
    canHireAssociates: true,
    canApproveAgreements: true
  }
];

const mockLocationStatus: LocationOperationalStatus[] = [
  {
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    operationalStatus: 'OPERATIONAL',
    currentStaffCount: 4,
    minimumStaffRequired: 2,
    optimalStaffCount: 6,
    availableServices: ['Traditional Kava', 'Modern Mixology', 'Cultural Education', 'Private Events'],
    temporarilyUnavailableServices: [],
    dailyCapacityPercentage: 85.5,
    serviceQualityScore: 4.7,
    statusNotes: 'Running at good capacity with excellent service quality',
    lastStatusUpdate: '2024-10-18T14:30:00Z'
  }
];

const mockRoleDeclarations: RoleDeclaration[] = [
  {
    id: 'rd001',
    locationId: 'loc_main_store',
    roleType: 'HOST',
    positionsNeeded: 2,
    priorityLevel: 2,
    hourlyRateMin: 18.00,
    hourlyRateMax: 25.00,
    declarationStatus: 'ACTIVE',
    declaredBy: 'usr_loc_main',
    createdAt: '2024-10-15T08:00:00Z'
  },
  {
    id: 'rd002',
    locationId: 'loc_main_store',
    roleType: 'KAVARISTA',
    positionsNeeded: 3,
    priorityLevel: 3,
    hourlyRateMin: 16.00,
    hourlyRateMax: 22.00,
    declarationStatus: 'ACTIVE',
    declaredBy: 'usr_loc_main',
    createdAt: '2024-10-15T08:30:00Z'
  }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'OPERATIONAL': 'green',
    'LIMITED_SERVICE': 'yellow',
    'MAINTENANCE': 'orange',
    'EMERGENCY': 'red',
    'SEASONAL_CLOSED': 'gray',
    'ACTIVE': 'green',
    'FILLED': 'blue',
    'SUSPENDED': 'orange',
    'CANCELLED': 'gray'
  };
  return colors[status] || 'gray';
};

const getAccessIcon = (access: string) => {
  switch (access) {
    case 'FULL': return <Shield className="h-4 w-4 text-green-600" />;
    case 'MODIFY': return <Edit className="h-4 w-4 text-blue-600" />;
    case 'VIEW_EDIT': return <Eye className="h-4 w-4 text-yellow-600" />;
    case 'VIEW_ONLY': return <Eye className="h-4 w-4 text-gray-600" />;
    default: return <div className="h-4 w-4" />;
  }
};

const getPriorityLabel = (level: number) => {
  if (level <= 2) return { label: 'Critical', color: 'destructive' };
  if (level <= 4) return { label: 'High', color: 'orange' };
  if (level <= 6) return { label: 'Medium', color: 'yellow' };
  return { label: 'Low', color: 'gray' };
};

// ============================================
// MAIN COMPONENT
// ============================================

export function LocationCenteredManagement() {
  const [selectedLocation, setSelectedLocation] = useState<string>(mockLocationAccess[0]?.locationId || '');
  const [loading, setLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'location' | 'central'>('location');
  
  // Form states
  const [newRoleForm, setNewRoleForm] = useState({
    roleType: 'KAVARISTA' as const,
    positionsNeeded: 1,
    priorityLevel: 5,
    hourlyRateMin: 15.00,
    hourlyRateMax: 20.00
  });

  const currentLocationAccess = mockLocationAccess.find(access => access.locationId === selectedLocation);
  const currentLocationStatus = mockLocationStatus.find(status => status.locationId === selectedLocation);
  const currentRoleDeclarations = mockRoleDeclarations.filter(role => role.locationId === selectedLocation);

  // Determine if user has central operations access
  const hasCentralAccess = mockCurrentUser.userType === 'CENTRAL_OPERATIONS' || mockCurrentUser.userType === 'SYSTEM_ADMIN';

  // If user has central access and chooses central view, show central dashboard
  if (hasCentralAccess && viewMode === 'central') {
    return <CentralOperationsDashboard />;
  }

  const handleDeclareRole = async () => {
    try {
      // API call would go here
      console.log('Declaring role:', { ...newRoleForm, locationId: selectedLocation });
      setShowRoleDialog(false);
      // Reset form
      setNewRoleForm({
        roleType: 'KAVARISTA',
        positionsNeeded: 1,
        priorityLevel: 5,
        hourlyRateMin: 15.00,
        hourlyRateMax: 20.00
      });
    } catch (error) {
      console.error('Error declaring role:', error);
    }
  };

  const canDeclareRoles = currentLocationAccess?.roleDeclarationAccess === 'FULL';
  const canManagePersonnel = currentLocationAccess?.personnelManagementAccess === 'FULL';
  const canViewFinancials = currentLocationAccess?.financialAccess !== 'NONE';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Location Management
          </h1>
          <p className="text-muted-foreground mt-2">
            {mockCurrentUser.userType === 'LOCATION_MANAGER' 
              ? 'Manage your assigned location operations and team'
              : 'Multi-location oversight and coordination'
            }
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {mockCurrentUser.userType.replace('_', ' ')}
          </Badge>
          
          {hasCentralAccess && (
            <Select value={viewMode} onValueChange={(value: 'location' | 'central') => setViewMode(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="location">Location Management</SelectItem>
                <SelectItem value="central">Central Operations</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {mockLocationAccess.length > 1 && viewMode === 'location' && (
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {mockLocationAccess.map((access) => (
                  <SelectItem key={access.locationId} value={access.locationId}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {access.locationName}
                      {access.isPrimaryManager && (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Location Status Overview */}
      {currentLocationStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={getStatusColor(currentLocationStatus.operationalStatus) as any}>
                {currentLocationStatus.operationalStatus.replace('_', ' ')}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(currentLocationStatus.lastStatusUpdate).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Count</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentLocationStatus.currentStaffCount}/{currentLocationStatus.optimalStaffCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum: {currentLocationStatus.minimumStaffRequired}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentLocationStatus.dailyCapacityPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of optimal capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Quality</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentLocationStatus.serviceQualityScore}/5.0
              </div>
              <p className="text-xs text-muted-foreground">
                Quality rating
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Access Summary */}
      {currentLocationAccess && (
        <Card>
          <CardHeader>
            <CardTitle>Your Access Level</CardTitle>
            <CardDescription>
              Permissions for {currentLocationAccess.locationName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {getAccessIcon(currentLocationAccess.locationManagementAccess)}
                <span className="text-sm">Location Management</span>
              </div>
              <div className="flex items-center gap-2">
                {getAccessIcon(currentLocationAccess.personnelManagementAccess)}
                <span className="text-sm">Personnel Management</span>
              </div>
              <div className="flex items-center gap-2">
                {getAccessIcon(currentLocationAccess.roleDeclarationAccess)}
                <span className="text-sm">Role Declarations</span>
              </div>
              <div className="flex items-center gap-2">
                {getAccessIcon(currentLocationAccess.financialAccess)}
                <span className="text-sm">Financial Access</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-4">
              {currentLocationAccess.canHireAssociates && (
                <Badge variant="outline">Can Hire Associates</Badge>
              )}
              {currentLocationAccess.canApproveAgreements && (
                <Badge variant="outline">Can Approve Agreements</Badge>
              )}
              {currentLocationAccess.isPrimaryManager && (
                <Badge variant="default">Primary Manager</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Management Tabs */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="personnel">Personnel</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          {canViewFinancials && (
            <TabsTrigger value="financials">Financials</TabsTrigger>
          )}
        </TabsList>

        {/* Role Management Tab */}
        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Role Declarations</CardTitle>
                <CardDescription>
                  Roles needed for this location to operate effectively
                </CardDescription>
              </div>
              {canDeclareRoles && (
                <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Declare Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Declare New Service Role</DialogTitle>
                      <DialogDescription>
                        Define what roles your location needs
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="roleType">Role Type</Label>
                        <Select value={newRoleForm.roleType} onValueChange={(value: any) => 
                          setNewRoleForm(prev => ({ ...prev, roleType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KAVATENDER">Kavatender (Beverages Only)</SelectItem>
                            <SelectItem value="KAVARISTA">Kavarista (Client Interaction + Beverages)</SelectItem>
                            <SelectItem value="HOST">Host (Management + All Capabilities)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="positionsNeeded">Positions Needed</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newRoleForm.positionsNeeded}
                            onChange={(e) => setNewRoleForm(prev => ({ 
                              ...prev, 
                              positionsNeeded: parseInt(e.target.value) || 1 
                            }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="priorityLevel">Priority (1-10)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={newRoleForm.priorityLevel}
                            onChange={(e) => setNewRoleForm(prev => ({ 
                              ...prev, 
                              priorityLevel: parseInt(e.target.value) || 5 
                            }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRateMin">Min Hourly Rate</Label>
                          <Input
                            type="number"
                            step="0.50"
                            value={newRoleForm.hourlyRateMin}
                            onChange={(e) => setNewRoleForm(prev => ({ 
                              ...prev, 
                              hourlyRateMin: parseFloat(e.target.value) || 15.00 
                            }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="hourlyRateMax">Max Hourly Rate</Label>
                          <Input
                            type="number"
                            step="0.50"
                            value={newRoleForm.hourlyRateMax}
                            onChange={(e) => setNewRoleForm(prev => ({ 
                              ...prev, 
                              hourlyRateMax: parseFloat(e.target.value) || 20.00 
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleDeclareRole}>
                        Declare Role
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Type</TableHead>
                    <TableHead>Positions</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Rate Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRoleDeclarations.map((declaration) => {
                    const priority = getPriorityLabel(declaration.priorityLevel);
                    return (
                      <TableRow key={declaration.id}>
                        <TableCell className="font-medium">
                          {declaration.roleType}
                        </TableCell>
                        <TableCell>{declaration.positionsNeeded}</TableCell>
                        <TableCell>
                          <Badge variant={priority.color as any}>
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${declaration.hourlyRateMin.toFixed(2)} - ${declaration.hourlyRateMax.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(declaration.declarationStatus) as any}>
                            {declaration.declarationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canManagePersonnel && (
                              <Button size="sm">
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personnel Tab */}
        <TabsContent value="personnel">
          <Card>
            <CardHeader>
              <CardTitle>Personnel Management</CardTitle>
              <CardDescription>
                Manage associates and service assignments for this location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Personnel management interface will be integrated here based on your access level.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Daily Operations</CardTitle>
              <CardDescription>
                Location status, schedules, and operational management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Operations management interface will be integrated here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        {canViewFinancials && (
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Revenue, costs, and financial performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Financial management interface will be integrated here based on your access level.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}