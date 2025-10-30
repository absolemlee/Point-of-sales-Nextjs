/**
 * Integrated Location Management Dashboard
 * Combines location management with role-based executive functionality
 * Shows different views based on user permissions
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Settings, 
  Users, 
  Crown, 
  UserPlus, 
  ClipboardList,
  Eye,
  Edit,
  Calendar,
  Package,
  BarChart3
} from 'lucide-react';
import { LocationForm } from './location-form';
import { LocationProducts } from './location-products';
import { LocationInventory } from './location-inventory';
import { LocationHours } from './location-hours';
import { LocationEvents } from './location-events';
import { getCurrentUser, hasPermission, getAccessibleLocations, getUserTypeLabel, getUserTypeColor, type UserProfile } from '@/lib/user-permissions';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Location {
  id: string;
  name: string;
  type: 'STATIC' | 'POPUP' | 'VENUE_PARTNERSHIP';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'CLOSED';
  address?: string;
  coordinates?: { lat: number; lng: number };
  operatingHours?: any;
  contactInfo?: any;
  settings?: any;
  createdAt: string;
  updatedAt: string;
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
  isFusedRole: boolean;
  experienceRequirements: string;
  createdAt: string;
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export function IntegratedLocationDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showSubComponent, setShowSubComponent] = useState<{type: string, locationId: string} | null>(null);
  
  // User permissions
  const currentUser = getCurrentUser();
  
  // Executive data
  const [roleDeclarations, setRoleDeclarations] = useState<RoleDeclaration[]>([]);
  const [serviceOffers, setServiceOffers] = useState<any[]>([]);
  const [qualifiedAssociates, setQualifiedAssociates] = useState<any[]>([]);
  
  // Role management dialogs
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    locationId: '',
    roleType: 'KAVARISTA' as const,
    positionsNeeded: 1,
    priorityLevel: 5,
    hourlyRateMin: 15.00,
    hourlyRateMax: 20.00,
    experienceRequirements: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch locations
      const locationsResponse = await fetch('/api/locations');
      const locationsData = await locationsResponse.json();
      const allLocations = locationsData.locations || [];
      const accessibleLocations = getAccessibleLocations(currentUser, allLocations);
      setLocations(accessibleLocations);
      
      // Fetch executive data if user has permissions
      if (hasPermission(currentUser, 'canDeclareRoles')) {
        const executiveResponse = await fetch('/api/executive-locations');
        const executiveData = await executiveResponse.json();
        if (executiveData.success) {
          setRoleDeclarations(executiveData.data.roleDeclarations || []);
          setServiceOffers(executiveData.data.serviceOffers || []);
          setQualifiedAssociates(executiveData.data.qualifiedAssociates || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareRole = async () => {
    try {
      const response = await fetch('/api/executive-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'declare-role',
          data: {
            ...newRoleForm,
            declaredBy: currentUser.associateId
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        await fetchData();
        setShowRoleDialog(false);
        setNewRoleForm({
          locationId: '',
          roleType: 'KAVARISTA',
          positionsNeeded: 1,
          priorityLevel: 5,
          hourlyRateMin: 15.00,
          hourlyRateMax: 20.00,
          experienceRequirements: ''
        });
      }
    } catch (error) {
      console.error('Error declaring role:', error);
    }
  };

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedLocation(null);
    fetchData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'STATIC': return '🏪';
      case 'POPUP': return '⛺';
      case 'VENUE_PARTNERSHIP': return '🤝';
      default: return '📍';
    }
  };

  const getRoleTypeLabel = (roleType: string) => {
    const labels: { [key: string]: string } = {
      'KAVATENDER': 'Kavatender',
      'KAVARISTA': 'Kavarista', 
      'HOST': 'Host'
    };
    return labels[roleType] || roleType;
  };

  const getPriorityLabel = (level: number) => {
    if (level <= 2) return { label: 'Critical', color: 'destructive' };
    if (level <= 4) return { label: 'High', color: 'orange' };
    if (level <= 6) return { label: 'Medium', color: 'yellow' };
    return { label: 'Low', color: 'gray' };
  };

  // Handle sub-components
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return <LocationForm location={selectedLocation} onClose={handleCloseForm} />;
  }

  if (showSubComponent) {
    const location = locations.find(l => l.id === showSubComponent.locationId);
    if (location) {
      switch (showSubComponent.type) {
        case 'products':
          return <LocationProducts location={location} onBack={() => setShowSubComponent(null)} />;
        case 'inventory':
          return <LocationInventory location={location} onBack={() => setShowSubComponent(null)} />;
        case 'hours':
          return <LocationHours location={location} onBack={() => setShowSubComponent(null)} />;
        case 'events':
          return <LocationEvents location={location} onBack={() => setShowSubComponent(null)} />;
      }
    }
  }

  const staticLocations = locations.filter(l => l.type === 'STATIC');
  const myRoleDeclarations = roleDeclarations.filter(d => 
    currentUser.assignedLocations.includes(d.locationId)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with User Context */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Location Management</h1>
            <Badge variant={getUserTypeColor(currentUser.userType) as any} className="h-6">
              {getUserTypeLabel(currentUser.userType)}
            </Badge>
          </div>
          <p className="text-gray-600">
            {currentUser.userType === 'EXECUTIVE_DIRECTOR' 
              ? `Executive oversight for ${currentUser.assignedLocations.length} location(s)` 
              : `Manage your kava locations and operations`}
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission(currentUser, 'canCreateLocations') && (
            <Button onClick={handleCreateLocation}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          )}
          {hasPermission(currentUser, 'canDeclareRoles') && (
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  Declare Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Declare New Service Role</DialogTitle>
                  <DialogDescription>
                    Define what roles your location needs to operate effectively
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <Select value={newRoleForm.locationId} onValueChange={(value) => 
                        setNewRoleForm(prev => ({ ...prev, locationId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {staticLocations.map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Role Type</Label>
                      <Select value={newRoleForm.roleType} onValueChange={(value: any) => 
                        setNewRoleForm(prev => ({ ...prev, roleType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KAVATENDER">Kavatender</SelectItem>
                          <SelectItem value="KAVARISTA">Kavarista</SelectItem>
                          <SelectItem value="HOST">Host</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Positions</Label>
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
                      <Label>Priority (1-10)</Label>
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
                      <Label>Min Rate $/hr</Label>
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
                      <Label>Max Rate $/hr</Label>
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
                  <div>
                    <Label>Experience Requirements</Label>
                    <Input
                      value={newRoleForm.experienceRequirements}
                      onChange={(e) => setNewRoleForm(prev => ({ 
                        ...prev, 
                        experienceRequirements: e.target.value 
                      }))}
                      placeholder="e.g., Minimum 6 months customer service experience"
                    />
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
        </div>
      </div>

      {/* Executive Stats (for Executive Directors only) */}
      {hasPermission(currentUser, 'canDeclareRoles') && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Roles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {myRoleDeclarations.filter(d => d.declarationStatus === 'ACTIVE').length}
                  </p>
                </div>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Offers</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {serviceOffers.filter(o => o.offerStatus === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Static Locations</p>
                  <p className="text-2xl font-bold text-blue-600">{staticLocations.length}</p>
                </div>
                <div className="text-xl">🏪</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Authority</p>
                  <p className="text-xl font-bold text-yellow-600 flex items-center gap-1">
                    <Crown className="h-5 w-5" />
                    CEO
                  </p>
                </div>
                <div className="text-xl">👑</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Standard Stats (for other user types) */}
      {!hasPermission(currentUser, 'canDeclareRoles') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Locations</p>
                  <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {locations.filter(l => l.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Static Locations</p>
                  <p className="text-2xl font-bold text-blue-600">{staticLocations.length}</p>
                </div>
                <div className="text-xl">🏪</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pop-ups</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {locations.filter(l => l.type === 'POPUP').length}
                  </p>
                </div>
                <div className="text-xl">⛺</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          {hasPermission(currentUser, 'canDeclareRoles') && (
            <>
              <TabsTrigger value="role-management">Role Management</TabsTrigger>
              <TabsTrigger value="service-offers">Service Offers</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Locations Tab */}
        <TabsContent value="locations">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {locations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(location.type)}</span>
                      <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <Badge className={`text-xs ${getStatusColor(location.status)}`}>
                          {location.status}
                        </Badge>
                      </div>
                    </div>
                    {hasPermission(currentUser, 'canEditAssignedLocations') && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditLocation(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {location.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{location.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {location.operatingHours ? 'Custom hours set' : 'Standard hours'}
                    </span>
                  </div>

                  {/* Executive Role Summary */}
                  {hasPermission(currentUser, 'canDeclareRoles') && location.type === 'STATIC' && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600 mb-2">Role Requirements:</div>
                      {myRoleDeclarations
                        .filter(d => d.locationId === location.id)
                        .slice(0, 2)
                        .map(declaration => (
                          <div key={declaration.id} className="text-xs bg-gray-50 p-2 rounded mb-1">
                            <span className="font-medium">{getRoleTypeLabel(declaration.roleType)}</span>
                            <span className="text-gray-500 ml-2">
                              {declaration.positionsNeeded} position(s)
                            </span>
                            <Badge 
                              variant={getPriorityLabel(declaration.priorityLevel).color as any}
                              className="ml-2 h-4 text-xs"
                            >
                              {getPriorityLabel(declaration.priorityLevel).label}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSubComponent({type: 'products', locationId: location.id})}
                      className="text-xs"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      Products
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSubComponent({type: 'hours', locationId: location.id})}
                      className="text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Hours
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSubComponent({type: 'inventory', locationId: location.id})}
                      className="text-xs"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Inventory
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSubComponent({type: 'events', locationId: location.id})}
                      className="text-xs"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Role Management Tab (Executive Directors only) */}
        {hasPermission(currentUser, 'canDeclareRoles') && (
          <TabsContent value="role-management">
            <Card>
              <CardHeader>
                <CardTitle>Role Declarations</CardTitle>
                <CardDescription>
                  Roles your locations need to operate effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Role Type</TableHead>
                      <TableHead>Positions</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Rate Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRoleDeclarations.map((declaration) => {
                      const location = locations.find(l => l.id === declaration.locationId);
                      const priority = getPriorityLabel(declaration.priorityLevel);
                      return (
                        <TableRow key={declaration.id}>
                          <TableCell className="font-medium">
                            {location?.name || declaration.locationId}
                          </TableCell>
                          <TableCell>{getRoleTypeLabel(declaration.roleType)}</TableCell>
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
                            <Badge variant={declaration.declarationStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                              {declaration.declarationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {declaration.declarationStatus === 'ACTIVE' && (
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
        )}

        {/* Service Offers Tab (Executive Directors only) */}
        {hasPermission(currentUser, 'canDeclareRoles') && (
          <TabsContent value="service-offers">
            <Card>
              <CardHeader>
                <CardTitle>Service Offers</CardTitle>
                <CardDescription>
                  Offers you've made to preferred associates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Associate</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceOffers
                      .filter(offer => offer.offeredBy === currentUser.associateId)
                      .map((offer) => {
                        const declaration = roleDeclarations.find(d => d.id === offer.locationRoleDeclarationId);
                        const location = locations.find(l => l.id === declaration?.locationId);
                        return (
                          <TableRow key={offer.id}>
                            <TableCell className="font-medium">
                              {offer.offeredToAssociateId}
                            </TableCell>
                            <TableCell>
                              {declaration ? getRoleTypeLabel(declaration.roleType) : 'Unknown'}
                            </TableCell>
                            <TableCell>{location?.name || 'Unknown'}</TableCell>
                            <TableCell>${offer.offeredHourlyRate.toFixed(2)}/hr</TableCell>
                            <TableCell>
                              <Badge variant={offer.offerStatus === 'PENDING' ? 'default' : 
                                             offer.offerStatus === 'ACCEPTED' ? 'default' : 'secondary'}>
                                {offer.offerStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>{offer.responseDeadline}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}