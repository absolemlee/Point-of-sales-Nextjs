// User Type and Permission System
// Defines user roles and their access levels throughout the application

// ============================================
// USER TYPE DEFINITIONS
// ============================================

export type UserType = 
  | 'SYSTEM_ADMIN'        // Full system access
  | 'EXECUTIVE_DIRECTOR'  // CEO-level location management
  | 'LOCATION_MANAGER'    // Single location management
  | 'ASSOCIATE'          // Service provider
  | 'READONLY_USER';     // View-only access

export interface UserPermissions {
  // Location Management
  canCreateLocations: boolean;
  canEditAllLocations: boolean;
  canEditAssignedLocations: boolean;
  canDeleteLocations: boolean;
  canViewLocationFinancials: boolean;
  
  // Role & Personnel Management  
  canDeclareRoles: boolean;
  canHireAssociates: boolean;
  canModifySchedules: boolean;
  canApproveAgreements: boolean;
  canOverridePolicies: boolean;
  canViewAllAssociates: boolean;
  canManageAssociateAssignments: boolean;
  
  // Service Management
  canMakeServiceOffers: boolean;
  canAcceptServiceOffers: boolean;
  canViewServiceSchedules: boolean;
  canModifyServiceSchedules: boolean;
  
  // System Administration
  canManageUsers: boolean;
  canAccessSystemSettings: boolean;
  canViewSystemReports: boolean;
  canManageIntegrations: boolean;
}

export interface UserProfile {
  id: string;
  associateId?: string; // Links to Associates table if applicable
  userType: UserType;
  email: string;
  firstName: string;
  lastName: string;
  permissions: UserPermissions;
  assignedLocations: string[]; // Location IDs this user can manage
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PERMISSION DEFINITIONS BY USER TYPE
// ============================================

export const DEFAULT_PERMISSIONS: Record<UserType, UserPermissions> = {
  SYSTEM_ADMIN: {
    // Location Management
    canCreateLocations: true,
    canEditAllLocations: true,
    canEditAssignedLocations: true,
    canDeleteLocations: true,
    canViewLocationFinancials: true,
    
    // Role & Personnel Management
    canDeclareRoles: true,
    canHireAssociates: true,
    canModifySchedules: true,
    canApproveAgreements: true,
    canOverridePolicies: true,
    canViewAllAssociates: true,
    canManageAssociateAssignments: true,
    
    // Service Management
    canMakeServiceOffers: true,
    canAcceptServiceOffers: false, // Admins don't accept offers
    canViewServiceSchedules: true,
    canModifyServiceSchedules: true,
    
    // System Administration
    canManageUsers: true,
    canAccessSystemSettings: true,
    canViewSystemReports: true,
    canManageIntegrations: true
  },
  
  EXECUTIVE_DIRECTOR: {
    // Location Management - CEO level authority
    canCreateLocations: true,
    canEditAllLocations: false, // Only assigned locations
    canEditAssignedLocations: true,
    canDeleteLocations: false, // Usually requires system admin
    canViewLocationFinancials: true,
    
    // Role & Personnel Management - Full authority for assigned locations
    canDeclareRoles: true,
    canHireAssociates: true,
    canModifySchedules: true,
    canApproveAgreements: true,
    canOverridePolicies: true,
    canViewAllAssociates: true, // Can see qualified pool
    canManageAssociateAssignments: true,
    
    // Service Management
    canMakeServiceOffers: true,
    canAcceptServiceOffers: false, // Directors make offers, don't accept them
    canViewServiceSchedules: true,
    canModifyServiceSchedules: true,
    
    // System Administration - Limited
    canManageUsers: false,
    canAccessSystemSettings: false,
    canViewSystemReports: true, // Can view reports for their locations
    canManageIntegrations: false
  },
  
  LOCATION_MANAGER: {
    // Location Management - Single location authority
    canCreateLocations: false,
    canEditAllLocations: false,
    canEditAssignedLocations: true, // Only their assigned location
    canDeleteLocations: false,
    canViewLocationFinancials: true, // For their location only
    
    // Role & Personnel Management - Limited to operational needs
    canDeclareRoles: false, // Usually Executive Directors declare roles
    canHireAssociates: false, // Can recommend but not hire
    canModifySchedules: true,
    canApproveAgreements: false, // Needs executive approval
    canOverridePolicies: false,
    canViewAllAssociates: false, // Only sees assigned associates
    canManageAssociateAssignments: true, // For their location
    
    // Service Management
    canMakeServiceOffers: false, // Usually Executive Directors make offers
    canAcceptServiceOffers: false,
    canViewServiceSchedules: true,
    canModifyServiceSchedules: true,
    
    // System Administration
    canManageUsers: false,
    canAccessSystemSettings: false,
    canViewSystemReports: false,
    canManageIntegrations: false
  },
  
  ASSOCIATE: {
    // Location Management - View only for assigned locations
    canCreateLocations: false,
    canEditAllLocations: false,
    canEditAssignedLocations: false,
    canDeleteLocations: false,
    canViewLocationFinancials: false,
    
    // Role & Personnel Management - Self-service only
    canDeclareRoles: false,
    canHireAssociates: false,
    canModifySchedules: false, // Can request changes
    canApproveAgreements: false,
    canOverridePolicies: false,
    canViewAllAssociates: false,
    canManageAssociateAssignments: false,
    
    // Service Management - Can respond to offers and view own schedules
    canMakeServiceOffers: false,
    canAcceptServiceOffers: true, // Can accept/decline offers made to them
    canViewServiceSchedules: true, // Own schedules only
    canModifyServiceSchedules: false, // Can request changes
    
    // System Administration
    canManageUsers: false,
    canAccessSystemSettings: false,
    canViewSystemReports: false,
    canManageIntegrations: false
  },
  
  READONLY_USER: {
    // All permissions set to false - view only access
    canCreateLocations: false,
    canEditAllLocations: false,
    canEditAssignedLocations: false,
    canDeleteLocations: false,
    canViewLocationFinancials: false,
    canDeclareRoles: false,
    canHireAssociates: false,
    canModifySchedules: false,
    canApproveAgreements: false,
    canOverridePolicies: false,
    canViewAllAssociates: false,
    canManageAssociateAssignments: false,
    canMakeServiceOffers: false,
    canAcceptServiceOffers: false,
    canViewServiceSchedules: false,
    canModifyServiceSchedules: false,
    canManageUsers: false,
    canAccessSystemSettings: false,
    canViewSystemReports: false,
    canManageIntegrations: false
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user has specific permission
 */
export function hasPermission(user: UserProfile, permission: keyof UserPermissions): boolean {
  return user.permissions[permission] === true;
}

/**
 * Check if user can access specific location
 */
export function canAccessLocation(user: UserProfile, locationId: string): boolean {
  // System admins can access all locations
  if (user.userType === 'SYSTEM_ADMIN') return true;
  
  // Others can only access assigned locations
  return user.assignedLocations.includes(locationId);
}

/**
 * Get user's accessible locations
 */
export function getAccessibleLocations(user: UserProfile, allLocations: any[]): any[] {
  if (user.userType === 'SYSTEM_ADMIN') {
    return allLocations;
  }
  
  return allLocations.filter(location => 
    user.assignedLocations.includes(location.id)
  );
}

/**
 * Get user type display label
 */
export function getUserTypeLabel(userType: UserType): string {
  const labels: Record<UserType, string> = {
    'SYSTEM_ADMIN': 'System Administrator',
    'EXECUTIVE_DIRECTOR': 'Executive Director',
    'LOCATION_MANAGER': 'Location Manager',
    'ASSOCIATE': 'Associate',
    'READONLY_USER': 'Read-Only User'
  };
  return labels[userType];
}

/**
 * Get user type color for UI display
 */
export function getUserTypeColor(userType: UserType): string {
  const colors: Record<UserType, string> = {
    'SYSTEM_ADMIN': 'purple',
    'EXECUTIVE_DIRECTOR': 'gold',
    'LOCATION_MANAGER': 'blue',
    'ASSOCIATE': 'green',
    'READONLY_USER': 'gray'
  };
  return colors[userType];
}

// ============================================
// MOCK USER DATA FOR DEVELOPMENT
// ============================================

export const mockUsers: UserProfile[] = [
  {
    id: 'user_001',
    associateId: 'KAV001',
    userType: 'EXECUTIVE_DIRECTOR',
    email: 'malia.nakamura@kavapr.com',
    firstName: 'Malia',
    lastName: 'Nakamura',
    permissions: DEFAULT_PERMISSIONS.EXECUTIVE_DIRECTOR,
    assignedLocations: ['loc_main_store'],
    isActive: true,
    lastLogin: '2024-10-18T08:00:00Z',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-10-18T08:00:00Z'
  },
  {
    id: 'user_002',
    associateId: 'KAV002',
    userType: 'EXECUTIVE_DIRECTOR',
    email: 'kai.henderson@kavapr.com',
    firstName: 'Kai',
    lastName: 'Henderson',
    permissions: DEFAULT_PERMISSIONS.EXECUTIVE_DIRECTOR,
    assignedLocations: ['loc_wholesale_hub'],
    isActive: true,
    lastLogin: '2024-10-18T07:30:00Z',
    createdAt: '2024-09-15T00:00:00Z',
    updatedAt: '2024-10-18T07:30:00Z'
  },
  {
    id: 'user_003',
    associateId: 'KAV003',
    userType: 'LOCATION_MANAGER',
    email: 'leilani.torres@kavapr.com',
    firstName: 'Leilani',
    lastName: 'Torres',
    permissions: DEFAULT_PERMISSIONS.LOCATION_MANAGER,
    assignedLocations: ['loc_farmers_market'],
    isActive: true,
    lastLogin: '2024-10-17T16:00:00Z',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-17T16:00:00Z'
  },
  {
    id: 'user_004',
    userType: 'SYSTEM_ADMIN',
    email: 'admin@kavapr.com',
    firstName: 'System',
    lastName: 'Administrator',
    permissions: DEFAULT_PERMISSIONS.SYSTEM_ADMIN,
    assignedLocations: [], // Admins have access to all locations
    isActive: true,
    lastLogin: '2024-10-18T09:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-10-18T09:00:00Z'
  }
];

/**
 * Get current user (mock function - replace with actual auth)
 */
export function getCurrentUser(): UserProfile {
  // For development, return the first executive director
  // In production, this would get the authenticated user
  return mockUsers[0]; // Malia Nakamura as Executive Director
}