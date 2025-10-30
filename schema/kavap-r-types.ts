/**
 * KavaPR Enhanced Types
 * 
 * This extends the existing schema with KavaPR organizational structure
 * while maintaining compatibility with the current codebase.
 */

import * as z from 'zod';

// ========================================
// EXTEND EXISTING USER ROLES
// ========================================

export enum KavaPRRole {
  // Top-tier administrative roles
  SUPERADMIN = 'SUPERADMIN',
  FULLADMIN = 'FULLADMIN',
  ADMIN = 'ADMIN',
  
  // Management hierarchy
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  COORDINATOR = 'COORDINATOR',
  
  // Specialized roles
  SPECIALIST = 'SPECIALIST',
  ANALYST = 'ANALYST',
  ASSISTANT = 'ASSISTANT',
  
  // Entry level and temporary
  INTERN = 'INTERN',
  CONTRACTOR = 'CONTRACTOR',
  
  // Legacy compatibility roles
  OWNER = 'OWNER',
  WORKER = 'WORKER', 
  UNKNOW = 'UNKNOW'
}

export enum LocationType {
  STATIC = 'STATIC',
  POPUP = 'POPUP',
  VENUE_PARTNERSHIP = 'VENUE_PARTNERSHIP',
  EVENT = 'EVENT'
}

export enum AccessLevel {
  READ_ONLY = 'READ_ONLY',
  SERVICE_ONLY = 'SERVICE_ONLY',
  OPERATIONAL = 'OPERATIONAL',
  FULL = 'FULL'
}

// ========================================
// CORE INTERFACES
// ========================================

export interface KavaPRUser {
  id: string;
  name: string;
  email: string;
  role: KavaPRRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  isActive: boolean;
  isTemporary: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UserLocationAccess {
  id: string;
  userId: string;
  locationId: string;
  accessLevel: AccessLevel;
  permissions: string[];
  validFrom: Date;
  validUntil?: Date;
}

export interface LocationStake {
  id: string;
  userId: string;
  locationId: string;
  stakePercentage: number;
  investmentAmount: number;
  startDate: Date;
  endDate?: Date;
}

export interface StakeholderInfo {
  stakes: LocationStake[];
  totalInvestment: number;
  portfolioValue: number;
  monthlyReturns: number;
}

export interface ProfessionalCertification {
  id: string;
  userId: string;
  certificationType: string;
  certificationLevel: string;
  issuedDate: Date;
  expiryDate?: Date;
  isActive: boolean;
}

export interface TemporalAccess {
  locationId: string;
  accessType: 'PERMANENT' | 'TEMPORARY' | 'SCHEDULED';
  startTime: Date;
  endTime?: Date;
  remainingTime?: number;
  autoExpire: boolean;
}

// ========================================
// EDITABLE CONFIGURATION INTERFACES
// ========================================

export interface EditableRoleConfig {
  id: string;
  roleName: string;
  roleKey: KavaPRRole;
  description: string;
  permissions: string[];
  isSystemRole: boolean; // Can't be deleted if true
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditableLocationTypeConfig {
  id: string;
  typeName: string;
  typeKey: LocationType;
  description: string;
  allowsTemporary: boolean;
  defaultPermissions: string[];
  isSystemType: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditablePermissionConfig {
  id: string;
  permissionName: string;
  permissionKey: string;
  description: string;
  category: string;
  isSystemPermission: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationConfig {
  id: string;
  organizationName: string;
  description: string;
  settings: {
    allowTemporalAccess: boolean;
    requireApprovalForNewLocations: boolean;
    allowStakeholderManagement: boolean;
    enableProfessionalServices: boolean;
    enableSupplyChain: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// VALIDATION SCHEMAS
// ========================================

export const userRoleSchema = z.object({
  roleName: z.string().min(2, 'Role name must be at least 2 characters'),
  roleKey: z.nativeEnum(KavaPRRole),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  permissions: z.array(z.string()),
  isActive: z.boolean().default(true)
});

export const locationTypeSchema = z.object({
  typeName: z.string().min(2, 'Type name must be at least 2 characters'),
  typeKey: z.nativeEnum(LocationType),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  allowsTemporary: z.boolean().default(false),
  defaultPermissions: z.array(z.string()),
  isActive: z.boolean().default(true)
});

export const permissionSchema = z.object({
  permissionName: z.string().min(2, 'Permission name must be at least 2 characters'),
  permissionKey: z.string().min(2, 'Permission key must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category must be specified'),
  isActive: z.boolean().default(true)
});

export const locationSchema = z.object({
  name: z.string().min(2, 'Location name must be at least 2 characters'),
  type: z.nativeEnum(LocationType),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  isTemporary: z.boolean().default(false),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true)
}).refine(
  (data) => {
    if (data.isTemporary && data.endDate) {
      return data.endDate > (data.startDate || new Date());
    }
    return true;
  },
  {
    message: 'End date must be after start date for temporary locations',
    path: ['endDate']
  }
);

export const userLocationAccessSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  locationId: z.string().min(1, 'Location ID required'),
  accessLevel: z.nativeEnum(AccessLevel),
  permissions: z.array(z.string()),
  validFrom: z.date(),
  validUntil: z.date().optional()
}).refine(
  (data) => {
    if (data.validUntil) {
      return data.validUntil > data.validFrom;
    }
    return true;
  },
  {
    message: 'Valid until date must be after valid from date',
    path: ['validUntil']
  }
);

export const locationStakeSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  locationId: z.string().min(1, 'Location ID required'),
  stakePercentage: z.number().min(0.01, 'Stake must be at least 0.01%').max(100, 'Stake cannot exceed 100%'),
  investmentAmount: z.number().min(0.01, 'Investment amount must be positive'),
  startDate: z.date(),
  endDate: z.date().optional()
}).refine(
  (data) => {
    if (data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const organizationConfigSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  settings: z.object({
    allowTemporalAccess: z.boolean().default(true),
    requireApprovalForNewLocations: z.boolean().default(false),
    allowStakeholderManagement: z.boolean().default(true),
    enableProfessionalServices: z.boolean().default(true),
    enableSupplyChain: z.boolean().default(true)
  })
});

// ========================================
// DEFAULT CONFIGURATIONS
// ========================================

export const DEFAULT_PERMISSIONS = [
  // Basic access
  'VIEW_DASHBOARD',
  'VIEW_PROFILE',
  
  // POS operations
  'POS_ACCESS',
  'PROCESS_SALES',
  'HANDLE_RETURNS',
  
  // Inventory management
  'VIEW_INVENTORY',
  'UPDATE_INVENTORY',
  'PLACE_ORDERS',
  'APPROVE_ORDERS',
  
  // Staff management
  'VIEW_STAFF',
  'MANAGE_STAFF',
  'MANAGE_SCHEDULES',
  'APPROVE_TIMECARDS',
  
  // Financial access
  'VIEW_SALES_REPORTS',
  'VIEW_FINANCIAL_REPORTS',
  'MANAGE_FINANCES',
  
  // Location management
  'CREATE_LOCATIONS',
  'MODIFY_LOCATIONS',
  'DELETE_LOCATIONS',
  'MANAGE_LOCATION_ACCESS',
  
  // System administration
  'MANAGE_USERS',
  'MANAGE_ROLES',
  'MANAGE_PERMISSIONS',
  'SYSTEM_CONFIGURATION',
  
  // Professional services
  'CREATE_SERVICES',
  'MANAGE_SERVICE_AGREEMENTS',
  'PROCESS_SERVICE_PAYMENTS',
  
  // Stakeholder management
  'VIEW_STAKES',
  'MANAGE_STAKES',
  'VIEW_PARTNER_REPORTS',
  
  // Supply chain
  'MANAGE_SUPPLY_CHAIN',
  'APPROVE_SUPPLY_ORDERS',
  'MANAGE_SUPPLIERS'
];

export const DEFAULT_ROLE_PERMISSIONS: Record<KavaPRRole, string[]> = {
  [KavaPRRole.SUPERADMIN]: [
    'system:admin',
    'users:admin',
    'locations:admin',
    'products:admin',
    'transactions:admin',
    'analytics:admin',
    'configuration:admin',
    'audit:admin'
  ],
  [KavaPRRole.FULLADMIN]: [
    'users:admin',
    'locations:admin',
    'products:admin',
    'transactions:admin',
    'analytics:admin',
    'configuration:write',
    'audit:read'
  ],
  [KavaPRRole.ADMIN]: [
    'users:write',
    'locations:write',
    'products:admin',
    'transactions:admin',
    'analytics:read',
    'configuration:read'
  ],
  [KavaPRRole.MANAGER]: [
    'users:read',
    'products:write',
    'transactions:write',
    'analytics:read',
    'reports:write'
  ],
  [KavaPRRole.SUPERVISOR]: [
    'products:write',
    'transactions:write',
    'analytics:read',
    'team:manage'
  ],
  [KavaPRRole.COORDINATOR]: [
    'products:write',
    'transactions:read',
    'analytics:read',
    'schedule:manage'
  ],
  [KavaPRRole.SPECIALIST]: [
    'products:write',
    'transactions:read',
    'quality:manage',
    'technical:admin'
  ],
  [KavaPRRole.ANALYST]: [
    'products:read',
    'transactions:read',
    'analytics:read',
    'reports:write'
  ],
  [KavaPRRole.ASSISTANT]: [
    'products:read',
    'transactions:read',
    'support:write'
  ],
  [KavaPRRole.INTERN]: [
    'products:read',
    'learning:access'
  ],
  [KavaPRRole.CONTRACTOR]: [
    'products:read',
    'transactions:read',
    'project:access'
  ],
  [KavaPRRole.OWNER]: [
    'system:admin',
    'users:admin',
    'locations:admin',
    'products:admin',
    'transactions:admin',
    'analytics:admin',
    'business:admin'
  ],
  [KavaPRRole.WORKER]: [
    'products:read',
    'transactions:write',
    'basic:access'
  ],
  [KavaPRRole.UNKNOW]: [
    'basic:access'
  ]
};

export default {
  KavaPRRole,
  LocationType,
  AccessLevel,
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  userRoleSchema,
  locationTypeSchema,
  permissionSchema,
  locationSchema,
  userLocationAccessSchema,
  locationStakeSchema,
  organizationConfigSchema
};