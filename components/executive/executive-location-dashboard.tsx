/**
 * Executive Location Management Dashboard
 * Provides CEO-level oversight for static location operations
 * Handles role declarations, executive assignments, and service management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Crown, 
  UserPlus, 
  MapPin, 
  Users, 
  ClipboardList, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ServiceRoleDeclaration {
  id: string;
  locationId: string;
  roleType: 'KAVATENDER' | 'KAVARISTA' | 'HOST' | 'EXECUTIVE_DIRECTOR';
  positionsNeeded: number;
  priorityLevel: number;
  hourlyRateMin: number;
  hourlyRateMax: number;
  shiftRequirements: any;
  isFusedRole: boolean;
  fusedWithRoles: string[];
  certificationRequirements: string[];
  experienceRequirements: string;
  declarationStatus: 'ACTIVE' | 'FILLED' | 'SUSPENDED' | 'CANCELLED';
  declaredBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ExecutiveAssignment {
  id: string;
  associateId: string;
  locationId: string;
  executiveTitle: string;
  hasCeoAuthority: boolean;
  oversightLevel: 'FULL' | 'OPERATIONAL' | 'ADVISORY';
  assignmentStartDate: string;
  assignmentEndDate?: string;
  isPrimaryExecutive: boolean;
  canDeclareRoles: boolean;
  canHireAssociates: boolean;
  canModifySchedules: boolean;
  canApproveAgreements: boolean;
  canOverridePolicies: boolean;
  assignmentStatus: 'ACTIVE' | 'TRANSITIONING' | 'SUSPENDED' | 'COMPLETED';
}

interface ServiceRoleOffer {
  id: string;
  locationRoleDeclarationId: string;
  offeredToAssociateId: string;
  offeredHourlyRate: number;
  offeredSchedule: any;
  specialTerms: string;
  offerStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'EXPIRED';
  offerDate: string;
  responseDeadline: string;
  responseDate?: string;
  offeredBy: string;
}

interface QualifiedAssociate {
  id: string;
  associateId: string;
  roleType: 'KAVATENDER' | 'KAVARISTA' | 'HOST' | 'EXECUTIVE_DIRECTOR';
  qualificationLevel: 'TRAINEE' | 'QUALIFIED' | 'EXPERT' | 'TRAINER';
  yearsInRole: number;
  locationsWorked: string[];
  specializations: string[];
  geographicAvailability: string[];
  scheduleAvailability: any;
  maxHoursPerWeek: number;
  preferredLocations: string[];
  preferredHourlyRateMin: number;
  willingToTravel: boolean;
  travelRadiusMiles: number;
  availabilityStatus: 'AVAILABLE' | 'PARTIALLY_AVAILABLE' | 'UNAVAILABLE' | 'COMMITTED';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getRoleTypeLabel = (roleType: string) => {
  const labels: { [key: string]: string } = {
    'KAVATENDER': 'Kavatender',
    'KAVARISTA': 'Kavarista', 
    'HOST': 'Host',
    'EXECUTIVE_DIRECTOR': 'Executive Director'
  };
  return labels[roleType] || roleType;
};

const getPriorityLabel = (level: number) => {
  if (level <= 2) return { label: 'Critical', color: 'destructive' };
  if (level <= 4) return { label: 'High', color: 'orange' };
  if (level <= 6) return { label: 'Medium', color: 'yellow' };
  return { label: 'Low', color: 'gray' };
};

const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'ACTIVE': 'green',
    'PENDING': 'yellow',
    'ACCEPTED': 'green',
    'DECLINED': 'red',
    'FILLED': 'blue',
    'SUSPENDED': 'orange',
    'CANCELLED': 'gray',
    'AVAILABLE': 'green',
    'PARTIALLY_AVAILABLE': 'yellow',
    'UNAVAILABLE': 'red',
    'COMMITTED': 'blue'
  };
  return colors[status] || 'gray';
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export function ExecutiveLocationDashboard() {
  const [roleDeclarations, setRoleDeclarations] = useState<ServiceRoleDeclaration[]>([]);
  const [executiveAssignments, setExecutiveAssignments] = useState<ExecutiveAssignment[]>([]);
  const [serviceOffers, setServiceOffers] = useState<ServiceRoleOffer[]>([]);
  const [qualifiedAssociates, setQualifiedAssociates] = useState<QualifiedAssociate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  
  // Dialog states
  const [showRoleDeclarationDialog, setShowRoleDeclarationDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<ServiceRoleDeclaration | null>(null);

  // Form states
  const [newRoleForm, setNewRoleForm] = useState({
    locationId: '',
    roleType: 'KAVARISTA' as const,
    positionsNeeded: 1,
    priorityLevel: 5,
    hourlyRateMin: 15.00,
    hourlyRateMax: 20.00,
    isFusedRole: false,
    fusedWithRoles: [] as string[],
    certificationRequirements: [] as string[],
    experienceRequirements: ''
  });

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const fetchExecutiveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/executive-locations');
      const result = await response.json();
      
      if (result.success) {
        setRoleDeclarations(result.data.roleDeclarations || []);
        setExecutiveAssignments(result.data.executiveAssignments || []);
        setServiceOffers(result.data.serviceOffers || []);
        setQualifiedAssociates(result.data.qualifiedAssociates || []);
      }
    } catch (error) {
      console.error('Error fetching executive data:', error);
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
            declaredBy: 'KAV001' // Current executive director
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        await fetchExecutiveData();
        setShowRoleDeclarationDialog(false);
        // Reset form
        setNewRoleForm({
          locationId: '',
          roleType: 'KAVARISTA',
          positionsNeeded: 1,
          priorityLevel: 5,
          hourlyRateMin: 15.00,
          hourlyRateMax: 20.00,
          isFusedRole: false,
          fusedWithRoles: [],
          certificationRequirements: [],
          experienceRequirements: ''
        });
      }
    } catch (error) {
      console.error('Error declaring role:', error);
    }
  };

  const handleMakeOffer = async (declarationId: string, associateId: string) => {
    try {
      const declaration = roleDeclarations.find(d => d.id === declarationId);
      if (!declaration) return;

      const response = await fetch('/api/executive-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'make-offer',
          data: {
            locationRoleDeclarationId: declarationId,
            offeredToAssociateId: associateId,
            offeredHourlyRate: (declaration.hourlyRateMin + declaration.hourlyRateMax) / 2,
            offeredSchedule: declaration.shiftRequirements,
            specialTerms: 'Standard partnership terms apply',
            responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
            offeredBy: 'KAV001'
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        await fetchExecutiveData();
      }
    } catch (error) {
      console.error('Error making offer:', error);
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading executive location management...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredDeclarations = selectedLocation === 'all' 
    ? roleDeclarations 
    : roleDeclarations.filter(d => d.locationId === selectedLocation);

  const availableLocations = Array.from(new Set(roleDeclarations.map(d => d.locationId)));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-600" />
            Executive Location Management
          </h1>
          <p className="text-muted-foreground mt-2">
            CEO-level oversight for static location operations and role management
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {availableLocations.map((locationId) => (
                <SelectItem key={locationId} value={locationId}>
                  {locationId.replace('loc_', '').replace('_', ' ').toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showRoleDeclarationDialog} onOpenChange={setShowRoleDeclarationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Declare Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Declare New Service Role</DialogTitle>
                <DialogDescription>
                  Define what roles your location needs to operate effectively
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="locationId">Location</Label>
                    <Select value={newRoleForm.locationId} onValueChange={(value) => 
                      setNewRoleForm(prev => ({ ...prev, locationId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loc_main_store">Main Store</SelectItem>
                        <SelectItem value="loc_wholesale_hub">Wholesale Hub</SelectItem>
                        <SelectItem value="loc_farmers_market">Farmers Market</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                </div>
                
                <div className="grid grid-cols-3 gap-4">
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
                  
                  <div>
                    <Label>
                      <input
                        type="checkbox"
                        checked={newRoleForm.isFusedRole}
                        onChange={(e) => setNewRoleForm(prev => ({ 
                          ...prev, 
                          isFusedRole: e.target.checked 
                        }))}
                        className="mr-2"
                      />
                      Fused Role
                    </Label>
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
                
                <div>
                  <Label htmlFor="experienceRequirements">Experience Requirements</Label>
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
                <Button variant="outline" onClick={() => setShowRoleDeclarationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeclareRole}>
                  Declare Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredDeclarations.filter(d => d.declarationStatus === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Roles currently seeking associates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceOffers.filter(o => o.offerStatus === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Offers awaiting responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Associates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualifiedAssociates.filter(q => q.availabilityStatus === 'AVAILABLE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executive Directors</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executiveAssignments.filter(e => e.assignmentStatus === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active location executives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="role-declarations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="role-declarations">Role Declarations</TabsTrigger>
          <TabsTrigger value="service-offers">Service Offers</TabsTrigger>
          <TabsTrigger value="qualified-pool">Qualified Associates</TabsTrigger>
          <TabsTrigger value="executives">Executive Assignments</TabsTrigger>
        </TabsList>

        {/* Role Declarations Tab */}
        <TabsContent value="role-declarations">
          <Card>
            <CardHeader>
              <CardTitle>Location Role Declarations</CardTitle>
              <CardDescription>
                Roles each static location has declared it needs to operate
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
                  {filteredDeclarations.map((declaration) => {
                    const priority = getPriorityLabel(declaration.priorityLevel);
                    return (
                      <TableRow key={declaration.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {declaration.locationId.replace('loc_', '').replace('_', ' ').toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getRoleTypeLabel(declaration.roleType)}</div>
                            {declaration.isFusedRole && (
                              <Badge variant="outline" className="mt-1">
                                Fused Role
                              </Badge>
                            )}
                          </div>
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDeclaration(declaration)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {declaration.declarationStatus === 'ACTIVE' && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  // Find qualified associates for this role
                                  const qualifiedForRole = qualifiedAssociates.filter(
                                    q => q.roleType === declaration.roleType && 
                                         q.availabilityStatus === 'AVAILABLE'
                                  );
                                  if (qualifiedForRole.length > 0) {
                                    handleMakeOffer(declaration.id, qualifiedForRole[0].associateId);
                                  }
                                }}
                              >
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

        {/* Service Offers Tab */}
        <TabsContent value="service-offers">
          <Card>
            <CardHeader>
              <CardTitle>Service Offers</CardTitle>
              <CardDescription>
                Preferred offers to specific associates for declared roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Associate</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Offer Date</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">
                        {offer.offeredToAssociateId}
                      </TableCell>
                      <TableCell>
                        {/* Find the role type from declaration */}
                        {roleDeclarations.find(d => d.id === offer.locationRoleDeclarationId)?.roleType || 'Unknown'}
                      </TableCell>
                      <TableCell>${offer.offeredHourlyRate.toFixed(2)}/hr</TableCell>
                      <TableCell>{offer.offerDate}</TableCell>
                      <TableCell>{offer.responseDeadline}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(offer.offerStatus) as any}>
                          {offer.offerStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Qualified Associates Tab */}
        <TabsContent value="qualified-pool">
          <Card>
            <CardHeader>
              <CardTitle>Qualified Associate Pool</CardTitle>
              <CardDescription>
                Associates qualified for roles with their availability status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Associate</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Preferred Rate</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualifiedAssociates.map((associate) => (
                    <TableRow key={associate.id}>
                      <TableCell className="font-medium">
                        {associate.associateId}
                      </TableCell>
                      <TableCell>{getRoleTypeLabel(associate.roleType)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {associate.qualificationLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{associate.yearsInRole} years</TableCell>
                      <TableCell>${associate.preferredHourlyRateMin.toFixed(2)}/hr</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(associate.availabilityStatus) as any}>
                          {associate.availabilityStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executive Assignments Tab */}
        <TabsContent value="executives">
          <Card>
            <CardHeader>
              <CardTitle>Executive Director Assignments</CardTitle>
              <CardDescription>
                KAVAPR Executive Directors with CEO authority over static locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Executive</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Authority Level</TableHead>
                    <TableHead>Assignment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executiveAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-600" />
                          {assignment.associateId}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.locationId.replace('loc_', '').replace('_', ' ').toUpperCase()}
                      </TableCell>
                      <TableCell>{assignment.executiveTitle}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.hasCeoAuthority ? 'default' : 'outline'}>
                          {assignment.oversightLevel}
                          {assignment.hasCeoAuthority && ' (CEO)'}
                        </Badge>
                      </TableCell>
                      <TableCell>{assignment.assignmentStartDate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(assignment.assignmentStatus) as any}>
                          {assignment.assignmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}