/**
 * Central Operations Dashboard
 * Multi-location oversight and coordination interface
 * Respects location autonomy while providing organizational coordination
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2,
  Users,
  BarChart3,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  Eye,
  UserCog,
  Target
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface LocationOverview {
  locationId: string;
  locationName: string;
  locationType: 'STATIC' | 'POPUP' | 'B2B_HUB' | 'FRANCHISE';
  operationalStatus: 'OPERATIONAL' | 'LIMITED_SERVICE' | 'MAINTENANCE' | 'EMERGENCY';
  primaryManager: string;
  currentStaffCount: number;
  optimalStaffCount: number;
  dailyCapacityPercentage: number;
  serviceQualityScore: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  activeRoleDeclarations: number;
  pendingOffers: number;
  lastUpdate: string;
}

interface SystemMetrics {
  totalLocations: number;
  operationalLocations: number;
  totalStaff: number;
  totalAssociates: number;
  totalRevenue: number;
  averageServiceQuality: number;
  criticalAlerts: number;
  pendingApprovals: number;
}

interface RegionalSummary {
  region: string;
  locationCount: number;
  totalStaff: number;
  averageCapacity: number;
  averageQuality: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  alerts: number;
}

interface PendingApproval {
  id: string;
  type: 'BUDGET_REQUEST' | 'PERSONNEL_TRANSFER' | 'ROLE_DECLARATION' | 'EXECUTIVE_ASSIGNMENT';
  locationId: string;
  locationName: string;
  requestedBy: string;
  amount?: number;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  submittedDate: string;
  deadline?: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockLocationOverviews: LocationOverview[] = [
  {
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    locationType: 'STATIC',
    operationalStatus: 'OPERATIONAL',
    primaryManager: 'Main Store Manager',
    currentStaffCount: 4,
    optimalStaffCount: 6,
    dailyCapacityPercentage: 85.5,
    serviceQualityScore: 4.7,
    monthlyRevenue: 45000,
    revenueGrowth: 12.5,
    activeRoleDeclarations: 2,
    pendingOffers: 1,
    lastUpdate: '2024-10-18T14:30:00Z'
  },
  {
    locationId: 'loc_wholesale_hub',
    locationName: 'Wholesale Distribution Hub',
    locationType: 'B2B_HUB',
    operationalStatus: 'LIMITED_SERVICE',
    primaryManager: 'Wholesale Hub Manager',
    currentStaffCount: 2,
    optimalStaffCount: 4,
    dailyCapacityPercentage: 60.0,
    serviceQualityScore: 4.2,
    monthlyRevenue: 85000,
    revenueGrowth: 8.3,
    activeRoleDeclarations: 1,
    pendingOffers: 0,
    lastUpdate: '2024-10-18T10:15:00Z'
  },
  {
    locationId: 'loc_farmers_market',
    locationName: 'Weekend Farmers Market',
    locationType: 'POPUP',
    operationalStatus: 'OPERATIONAL',
    primaryManager: 'Pop-up Coordinator',
    currentStaffCount: 2,
    optimalStaffCount: 3,
    dailyCapacityPercentage: 95.0,
    serviceQualityScore: 4.9,
    monthlyRevenue: 12000,
    revenueGrowth: 25.7,
    activeRoleDeclarations: 0,
    pendingOffers: 0,
    lastUpdate: '2024-10-18T11:00:00Z'
  }
];

const mockSystemMetrics: SystemMetrics = {
  totalLocations: 3,
  operationalLocations: 3,
  totalStaff: 8,
  totalAssociates: 15,
  totalRevenue: 142000,
  averageServiceQuality: 4.6,
  criticalAlerts: 1,
  pendingApprovals: 3
};

const mockRegionalSummaries: RegionalSummary[] = [
  {
    region: 'Austin Metro',
    locationCount: 2,
    totalStaff: 6,
    averageCapacity: 72.8,
    averageQuality: 4.45,
    monthlyRevenue: 130000,
    revenueGrowth: 10.4,
    alerts: 1
  },
  {
    region: 'Central Texas',
    locationCount: 1,
    totalStaff: 2,
    averageCapacity: 95.0,
    averageQuality: 4.9,
    monthlyRevenue: 12000,
    revenueGrowth: 25.7,
    alerts: 0
  }
];

const mockPendingApprovals: PendingApproval[] = [
  {
    id: 'pa001',
    type: 'BUDGET_REQUEST',
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    requestedBy: 'Main Store Manager',
    amount: 15000,
    description: 'Equipment upgrade for expanded beverage preparation capacity',
    priority: 'HIGH',
    submittedDate: '2024-10-16',
    deadline: '2024-10-25'
  },
  {
    id: 'pa002',
    type: 'PERSONNEL_TRANSFER',
    locationId: 'loc_wholesale_hub',
    locationName: 'Wholesale Distribution Hub',
    requestedBy: 'Wholesale Hub Manager',
    description: 'Request to transfer experienced Kavarista from Main Store to assist with B2B client education',
    priority: 'MEDIUM',
    submittedDate: '2024-10-17'
  },
  {
    id: 'pa003',
    type: 'ROLE_DECLARATION',
    locationId: 'loc_farmers_market',
    locationName: 'Weekend Farmers Market',
    requestedBy: 'Pop-up Coordinator',
    description: 'Declare need for additional weekend Host position due to increased demand',
    priority: 'LOW',
    submittedDate: '2024-10-18'
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
    'HIGH': 'red',
    'MEDIUM': 'yellow',
    'LOW': 'gray'
  };
  return colors[status] || 'gray';
};

const getLocationTypeIcon = (type: string) => {
  switch (type) {
    case 'STATIC': return <Building2 className="h-4 w-4" />;
    case 'POPUP': return <MapPin className="h-4 w-4" />;
    case 'B2B_HUB': return <Activity className="h-4 w-4" />;
    case 'FRANCHISE': return <Target className="h-4 w-4" />;
    default: return <Building2 className="h-4 w-4" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CentralOperationsDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredLocations = selectedRegion === 'all' 
    ? mockLocationOverviews 
    : mockLocationOverviews; // In real implementation, filter by region

  const criticalLocations = mockLocationOverviews.filter(
    loc => loc.operationalStatus === 'EMERGENCY' || loc.dailyCapacityPercentage < 50
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Central Operations
          </h1>
          <p className="text-muted-foreground mt-2">
            Multi-location oversight and organizational coordination
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Central Operations Authority
          </Badge>
          
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {mockRegionalSummaries.map((region) => (
                <SelectItem key={region.region} value={region.region}>
                  {region.region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* System-Wide Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSystemMetrics.operationalLocations}/{mockSystemMetrics.totalLocations}
            </div>
            <p className="text-xs text-muted-foreground">
              Operational locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockSystemMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSystemMetrics.averageServiceQuality.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Service quality score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockSystemMetrics.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Require approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalLocations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Locations Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalLocations.map((location) => (
                <div key={location.locationId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium">{location.locationName}</div>
                    <div className="text-sm text-orange-600">
                      {location.operationalStatus === 'EMERGENCY' 
                        ? 'Emergency status' 
                        : `Low capacity: ${formatPercentage(location.dailyCapacityPercentage)}`
                      }
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="locations">Location Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional Summary</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="analytics">System Analytics</TabsTrigger>
        </TabsList>

        {/* Location Overview Tab */}
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Location Performance Overview</CardTitle>
              <CardDescription>
                Real-time status and performance metrics for all locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Staffing</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((location) => (
                    <TableRow key={location.locationId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getLocationTypeIcon(location.locationType)}
                          <div>
                            <div>{location.locationName}</div>
                            <div className="text-xs text-muted-foreground">
                              {location.primaryManager}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {location.locationType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(location.operationalStatus) as any}>
                          {location.operationalStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {location.currentStaffCount}/{location.optimalStaffCount}
                          <div className="text-xs text-muted-foreground">
                            {location.activeRoleDeclarations} open roles
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm font-medium ${
                          location.dailyCapacityPercentage >= 80 ? 'text-green-600' :
                          location.dailyCapacityPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(location.dailyCapacityPercentage)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {location.serviceQualityScore.toFixed(1)}/5.0
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatCurrency(location.monthlyRevenue)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm font-medium ${
                          location.revenueGrowth >= 10 ? 'text-green-600' :
                          location.revenueGrowth >= 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          +{formatPercentage(location.revenueGrowth)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Summary Tab */}
        <TabsContent value="regional">
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance Summary</CardTitle>
              <CardDescription>
                Aggregated metrics by geographic region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Locations</TableHead>
                    <TableHead>Total Staff</TableHead>
                    <TableHead>Avg Capacity</TableHead>
                    <TableHead>Avg Quality</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Alerts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRegionalSummaries.map((region) => (
                    <TableRow key={region.region}>
                      <TableCell className="font-medium">{region.region}</TableCell>
                      <TableCell>{region.locationCount}</TableCell>
                      <TableCell>{region.totalStaff}</TableCell>
                      <TableCell>{formatPercentage(region.averageCapacity)}</TableCell>
                      <TableCell>{region.averageQuality.toFixed(1)}/5.0</TableCell>
                      <TableCell>{formatCurrency(region.monthlyRevenue)}</TableCell>
                      <TableCell className="text-green-600">
                        +{formatPercentage(region.revenueGrowth)}
                      </TableCell>
                      <TableCell>
                        {region.alerts > 0 ? (
                          <Badge variant="destructive">{region.alerts}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Requests from location managers requiring central approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPendingApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {approval.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {approval.locationName}
                      </TableCell>
                      <TableCell>{approval.requestedBy}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {approval.description}
                      </TableCell>
                      <TableCell>
                        {approval.amount ? formatCurrency(approval.amount) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(approval.priority) as any}>
                          {approval.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{approval.submittedDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="default">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>
                Comprehensive analytics and insights across the entire organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Service Quality:</span>
                      <span className="font-medium">{mockSystemMetrics.averageServiceQuality.toFixed(1)}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Associates:</span>
                      <span className="font-medium">{mockSystemMetrics.totalAssociates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System-wide Revenue:</span>
                      <span className="font-medium">{formatCurrency(mockSystemMetrics.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Operational Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Operational Locations:</span>
                      <span className="font-medium">{mockSystemMetrics.operationalLocations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Alerts:</span>
                      <span className="font-medium text-orange-600">{mockSystemMetrics.criticalAlerts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Approvals:</span>
                      <span className="font-medium">{mockSystemMetrics.pendingApprovals}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}