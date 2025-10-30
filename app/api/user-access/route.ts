// User Access Management API
// Handles user types, location permissions, and access control

import { NextRequest, NextResponse } from 'next/server';

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
  associateId?: string;
  lastLogin?: string;
}

interface LocationAccess {
  id: string;
  userAccountId: string;
  locationId: string;
  locationName: string;
  isPrimaryManager: boolean;
  locationManagementAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  personnelManagementAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  roleDeclarationAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  financialAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  inventoryAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  schedulingAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  reportingAccess: 'FULL' | 'MODIFY' | 'VIEW_EDIT' | 'VIEW_ONLY' | 'NONE';
  canOverridePolicies: boolean;
  canApproveAgreements: boolean;
  canHireAssociates: boolean;
  permissionStartDate: string;
  permissionEndDate?: string;
}

interface LocationOperationalStatus {
  id: string;
  locationId: string;
  locationName: string;
  operationalStatus: 'OPERATIONAL' | 'LIMITED_SERVICE' | 'MAINTENANCE' | 'EMERGENCY' | 'SEASONAL_CLOSED' | 'PERMANENTLY_CLOSED';
  currentStaffCount: number;
  minimumStaffRequired: number;
  optimalStaffCount: number;
  availableServices: string[];
  temporarilyUnavailableServices: string[];
  statusNotes?: string;
  lastStatusUpdate: string;
  updatedBy: string;
  dailyCapacityPercentage: number;
  serviceQualityScore: number;
  statusDate: string;
}

interface CentralOperationsScope {
  id: string;
  userAccountId: string;
  regionalScope: string[];
  locationTypeScope: string[];
  canViewAllLocations: boolean;
  canManageExecutives: boolean;
  canTransferPersonnel: boolean;
  canApproveBudgets: boolean;
  canAccessAnalytics: boolean;
  canManageCertifications: boolean;
  maxBudgetApprovalAmount: number;
  approvalRequiredAboveAmount: number;
  reportsTo?: string;
  directReports: string[];
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const mockUsers: UserAccount[] = [
  {
    id: 'usr_central_001',
    username: 'central.ops',
    email: 'central@kavapr.com',
    userType: 'CENTRAL_OPERATIONS',
    displayName: 'Central Operations',
    accountStatus: 'ACTIVE',
    lastLogin: '2024-10-18T09:30:00Z'
  },
  {
    id: 'usr_loc_main',
    username: 'main.manager',
    email: 'main.manager@kavapr.com',
    userType: 'LOCATION_MANAGER',
    displayName: 'Main Store Manager',
    accountStatus: 'ACTIVE',
    associateId: 'KAV001',
    lastLogin: '2024-10-18T08:15:00Z'
  },
  {
    id: 'usr_loc_wholesale',
    username: 'wholesale.manager',
    email: 'wholesale@kavapr.com',
    userType: 'LOCATION_MANAGER',
    displayName: 'Wholesale Hub Manager',
    accountStatus: 'ACTIVE',
    associateId: 'KAV002',
    lastLogin: '2024-10-18T07:45:00Z'
  },
  {
    id: 'usr_associate_001',
    username: 'kava.specialist',
    email: 'specialist@kavapr.com',
    userType: 'ASSOCIATE',
    displayName: 'Kava Specialist',
    accountStatus: 'ACTIVE',
    associateId: 'KAV003',
    lastLogin: '2024-10-17T16:30:00Z'
  }
];

const mockLocationAccess: LocationAccess[] = [
  {
    id: 'la001',
    userAccountId: 'usr_loc_main',
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    isPrimaryManager: true,
    locationManagementAccess: 'FULL',
    personnelManagementAccess: 'FULL',
    roleDeclarationAccess: 'FULL',
    financialAccess: 'MODIFY',
    inventoryAccess: 'FULL',
    schedulingAccess: 'FULL',
    reportingAccess: 'FULL',
    canOverridePolicies: true,
    canApproveAgreements: true,
    canHireAssociates: true,
    permissionStartDate: '2024-09-01'
  },
  {
    id: 'la002',
    userAccountId: 'usr_loc_wholesale',
    locationId: 'loc_wholesale_hub',
    locationName: 'Wholesale Distribution Hub',
    isPrimaryManager: true,
    locationManagementAccess: 'FULL',
    personnelManagementAccess: 'FULL',
    roleDeclarationAccess: 'FULL',
    financialAccess: 'MODIFY',
    inventoryAccess: 'FULL',
    schedulingAccess: 'FULL',
    reportingAccess: 'FULL',
    canOverridePolicies: true,
    canApproveAgreements: true,
    canHireAssociates: true,
    permissionStartDate: '2024-09-15'
  },
  {
    id: 'la003',
    userAccountId: 'usr_associate_001',
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    isPrimaryManager: false,
    locationManagementAccess: 'VIEW_ONLY',
    personnelManagementAccess: 'VIEW_ONLY',
    roleDeclarationAccess: 'NONE',
    financialAccess: 'NONE',
    inventoryAccess: 'VIEW_EDIT',
    schedulingAccess: 'VIEW_EDIT',
    reportingAccess: 'VIEW_ONLY',
    canOverridePolicies: false,
    canApproveAgreements: false,
    canHireAssociates: false,
    permissionStartDate: '2024-10-01'
  },
  {
    id: 'la004',
    userAccountId: 'usr_central_001',
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    isPrimaryManager: false,
    locationManagementAccess: 'MODIFY',
    personnelManagementAccess: 'MODIFY',
    roleDeclarationAccess: 'MODIFY',
    financialAccess: 'FULL',
    inventoryAccess: 'MODIFY',
    schedulingAccess: 'MODIFY',
    reportingAccess: 'FULL',
    canOverridePolicies: true,
    canApproveAgreements: true,
    canHireAssociates: true,
    permissionStartDate: '2024-08-01'
  },
  {
    id: 'la005',
    userAccountId: 'usr_central_001',
    locationId: 'loc_wholesale_hub',
    locationName: 'Wholesale Distribution Hub',
    isPrimaryManager: false,
    locationManagementAccess: 'MODIFY',
    personnelManagementAccess: 'MODIFY',
    roleDeclarationAccess: 'MODIFY',
    financialAccess: 'FULL',
    inventoryAccess: 'MODIFY',
    schedulingAccess: 'MODIFY',
    reportingAccess: 'FULL',
    canOverridePolicies: true,
    canApproveAgreements: true,
    canHireAssociates: true,
    permissionStartDate: '2024-08-01'
  }
];

const mockLocationStatus: LocationOperationalStatus[] = [
  {
    id: 'los001',
    locationId: 'loc_main_store',
    locationName: 'Main Kava Lounge',
    operationalStatus: 'OPERATIONAL',
    currentStaffCount: 4,
    minimumStaffRequired: 2,
    optimalStaffCount: 6,
    availableServices: ['Traditional Kava', 'Modern Mixology', 'Cultural Education', 'Private Events'],
    temporarilyUnavailableServices: [],
    statusNotes: 'Running at good capacity with excellent service quality',
    lastStatusUpdate: '2024-10-18T14:30:00Z',
    updatedBy: 'usr_loc_main',
    dailyCapacityPercentage: 85.5,
    serviceQualityScore: 4.7,
    statusDate: '2024-10-18'
  },
  {
    id: 'los002',
    locationId: 'loc_wholesale_hub',
    locationName: 'Wholesale Distribution Hub',
    operationalStatus: 'LIMITED_SERVICE',
    currentStaffCount: 2,
    minimumStaffRequired: 2,
    optimalStaffCount: 4,
    availableServices: ['Wholesale Orders', 'B2B Consultation'],
    temporarilyUnavailableServices: ['On-site Tastings'],
    statusNotes: 'Reduced capacity due to equipment maintenance',
    lastStatusUpdate: '2024-10-18T10:15:00Z',
    updatedBy: 'usr_loc_wholesale',
    dailyCapacityPercentage: 60.0,
    serviceQualityScore: 4.2,
    statusDate: '2024-10-18'
  }
];

const mockCentralOperationsScope: CentralOperationsScope[] = [
  {
    id: 'cos001',
    userAccountId: 'usr_central_001',
    regionalScope: ['Austin Metro', 'Central Texas'],
    locationTypeScope: ['STATIC', 'POPUP', 'B2B_HUB'],
    canViewAllLocations: true,
    canManageExecutives: true,
    canTransferPersonnel: true,
    canApproveBudgets: true,
    canAccessAnalytics: true,
    canManageCertifications: true,
    maxBudgetApprovalAmount: 50000.00,
    approvalRequiredAboveAmount: 10000.00,
    directReports: ['usr_loc_main', 'usr_loc_wholesale']
  }
];

// ============================================
// API ROUTE HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');
  const locationId = searchParams.get('locationId');

  try {
    switch (action) {
      case 'user-profile':
        if (!userId) {
          return NextResponse.json(
            { success: false, message: 'User ID required' },
            { status: 400 }
          );
        }
        
        const user = mockUsers.find(u => u.id === userId);
        if (!user) {
          return NextResponse.json(
            { success: false, message: 'User not found' },
            { status: 404 }
          );
        }

        const userAccess = mockLocationAccess.filter(la => la.userAccountId === userId);
        const centralScope = mockCentralOperationsScope.find(cos => cos.userAccountId === userId);

        return NextResponse.json({
          success: true,
          data: {
            user,
            locationAccess: userAccess,
            centralOperationsScope: centralScope
          },
          message: 'User profile retrieved successfully'
        });

      case 'location-access':
        if (!userId) {
          return NextResponse.json(
            { success: false, message: 'User ID required' },
            { status: 400 }
          );
        }

        const accessList = mockLocationAccess.filter(la => la.userAccountId === userId);
        return NextResponse.json({
          success: true,
          data: accessList,
          message: 'Location access permissions retrieved successfully'
        });

      case 'location-status':
        const statusList = locationId 
          ? mockLocationStatus.filter(ls => ls.locationId === locationId)
          : mockLocationStatus;
        
        return NextResponse.json({
          success: true,
          data: statusList,
          message: 'Location operational status retrieved successfully'
        });

      case 'all-users':
        return NextResponse.json({
          success: true,
          data: mockUsers,
          message: 'All users retrieved successfully'
        });

      default:
        // Return current user context (simulated for demo)
        const currentUser = mockUsers.find(u => u.username === 'main.manager') || mockUsers[1];
        const currentUserAccess = mockLocationAccess.filter(la => la.userAccountId === currentUser.id);
        const currentUserStatus = mockLocationStatus.filter(ls => 
          currentUserAccess.some(access => access.locationId === ls.locationId)
        );

        return NextResponse.json({
          success: true,
          data: {
            currentUser,
            locationAccess: currentUserAccess,
            locationStatus: currentUserStatus
          },
          message: 'Current user context retrieved successfully'
        });
    }
  } catch (error) {
    console.error('Error in user access API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process user access request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update-location-status':
        const { locationId, statusUpdate } = data;
        
        // Find and update the location status
        const statusIndex = mockLocationStatus.findIndex(ls => ls.locationId === locationId);
        if (statusIndex !== -1) {
          mockLocationStatus[statusIndex] = {
            ...mockLocationStatus[statusIndex],
            ...statusUpdate,
            lastStatusUpdate: new Date().toISOString(),
            statusDate: new Date().toISOString().split('T')[0]
          };
          
          return NextResponse.json({
            success: true,
            data: mockLocationStatus[statusIndex],
            message: 'Location status updated successfully'
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Location not found' },
          { status: 404 }
        );

      case 'grant-location-access':
        const { userAccountId, locationId: newLocationId, permissions } = data;
        
        const newAccess: LocationAccess = {
          id: `la${String(mockLocationAccess.length + 1).padStart(3, '0')}`,
          userAccountId,
          locationId: newLocationId,
          locationName: `Location ${newLocationId}`,
          permissionStartDate: new Date().toISOString().split('T')[0],
          ...permissions
        };
        
        mockLocationAccess.push(newAccess);
        
        return NextResponse.json({
          success: true,
          data: newAccess,
          message: 'Location access granted successfully'
        }, { status: 201 });

      case 'revoke-location-access':
        const { accessId } = data;
        
        const accessIndex = mockLocationAccess.findIndex(la => la.id === accessId);
        if (accessIndex !== -1) {
          const revokedAccess = mockLocationAccess.splice(accessIndex, 1)[0];
          
          return NextResponse.json({
            success: true,
            data: revokedAccess,
            message: 'Location access revoked successfully'
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'Access record not found' },
          { status: 404 }
        );

      case 'update-user-type':
        const { userId: updateUserId, newUserType } = data;
        
        const userIndex = mockUsers.findIndex(u => u.id === updateUserId);
        if (userIndex !== -1) {
          mockUsers[userIndex].userType = newUserType;
          
          return NextResponse.json({
            success: true,
            data: mockUsers[userIndex],
            message: 'User type updated successfully'
          });
        }
        
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing user access request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process user access request' },
      { status: 500 }
    );
  }
}