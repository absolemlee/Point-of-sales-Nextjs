/**
 * Location-Specific POS Interface Types
 * 
 * Defines different POS interface types that can be deployed based on:
 * - Location configuration
 * - Worker role and permissions 
 * - Shift assignments
 * - Device capabilities
 */

export enum POSInterfaceType {
  // Customer-facing interfaces
  CUSTOMER_ORDERING = 'CUSTOMER_ORDERING',
  CUSTOMER_KIOSK = 'CUSTOMER_KIOSK',
  
  // Worker-facing interfaces  
  ORDER_ENTRY = 'ORDER_ENTRY',
  PAYMENT_TERMINAL = 'PAYMENT_TERMINAL',
  KITCHEN_DISPLAY = 'KITCHEN_DISPLAY',
  MANAGER_TERMINAL = 'MANAGER_TERMINAL',
  
  // Specialized interfaces
  DRIVE_THRU = 'DRIVE_THRU',
  MOBILE_POS = 'MOBILE_POS',
  INVENTORY_TERMINAL = 'INVENTORY_TERMINAL'
}

export enum POSAccess {
  PUBLIC = 'PUBLIC',           // Anyone can access (customer interfaces)
  WORKER_SESSION = 'WORKER_SESSION',  // Requires active worker session
  ROLE_RESTRICTED = 'ROLE_RESTRICTED', // Specific role requirements
  MANAGER_ONLY = 'MANAGER_ONLY',       // Manager/admin only
  DEVICE_SPECIFIC = 'DEVICE_SPECIFIC'  // Tied to specific device/station
}

export interface POSInterfaceConfig {
  type: POSInterfaceType;
  accessLevel: POSAccess;
  requiredPermissions: string[];
  allowedRoles: string[];
  deviceRequirements?: {
    minScreenWidth?: number;
    minScreenHeight?: number;
    touchRequired?: boolean;
    cameraRequired?: boolean;
    printerRequired?: boolean;
    cashDrawerRequired?: boolean;
  };
  features: {
    canTakeOrders: boolean;
    canProcessPayments: boolean;
    canViewKitchen: boolean;
    canManageInventory: boolean;
    canAccessReports: boolean;
    canManageWorkers: boolean;
    canModifyPrices: boolean;
    canProcessRefunds: boolean;
    canOverrideDiscounts: boolean;
  };
}

export interface ActivePOSSession {
  sessionId: string;
  interfaceType: POSInterfaceType;
  locationId: string;
  workerId?: string;
  workerName?: string;
  shiftId?: string;
  stationId?: string;
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    ipAddress: string;
    lastActivity: string;
  };
  permissions: string[];
  startTime: string;
  status: 'ACTIVE' | 'IDLE' | 'LOCKED';
}

export interface POSInterfaceRoute {
  interfaceType: POSInterfaceType;
  path: string;
  displayName: string;
  description: string;
  icon: string;
  config: POSInterfaceConfig;
}

// Predefined interface configurations
export const POS_INTERFACE_CONFIGS: Record<POSInterfaceType, POSInterfaceConfig> = {
  [POSInterfaceType.CUSTOMER_ORDERING]: {
    type: POSInterfaceType.CUSTOMER_ORDERING,
    accessLevel: POSAccess.PUBLIC,
    requiredPermissions: [],
    allowedRoles: ['CUSTOMER'],
    features: {
      canTakeOrders: true,
      canProcessPayments: true,
      canViewKitchen: false,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: false,
      canOverrideDiscounts: false,
    },
  },
  
  [POSInterfaceType.ORDER_ENTRY]: {
    type: POSInterfaceType.ORDER_ENTRY,
    accessLevel: POSAccess.WORKER_SESSION,
    requiredPermissions: ['pos:order_entry'],
    allowedRoles: ['CASHIER', 'SERVER', 'MANAGER'],
    features: {
      canTakeOrders: true,
      canProcessPayments: true,
      canViewKitchen: false,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: true,
      canOverrideDiscounts: true,
    },
  },
  
  [POSInterfaceType.KITCHEN_DISPLAY]: {
    type: POSInterfaceType.KITCHEN_DISPLAY,
    accessLevel: POSAccess.WORKER_SESSION,
    requiredPermissions: ['pos:kitchen_display'],
    allowedRoles: ['COOK', 'KITCHEN_MANAGER', 'MANAGER'],
    features: {
      canTakeOrders: false,
      canProcessPayments: false,
      canViewKitchen: true,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: false,
      canOverrideDiscounts: false,
    },
  },
  
  [POSInterfaceType.PAYMENT_TERMINAL]: {
    type: POSInterfaceType.PAYMENT_TERMINAL,
    accessLevel: POSAccess.WORKER_SESSION,
    requiredPermissions: ['pos:payment_processing'],
    allowedRoles: ['CASHIER', 'MANAGER'],
    deviceRequirements: {
      touchRequired: true,
    },
    features: {
      canTakeOrders: false,
      canProcessPayments: true,
      canViewKitchen: false,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: true,
      canOverrideDiscounts: false,
    },
  },
  
  [POSInterfaceType.MANAGER_TERMINAL]: {
    type: POSInterfaceType.MANAGER_TERMINAL,
    accessLevel: POSAccess.MANAGER_ONLY,
    requiredPermissions: ['pos:full_access', 'pos:manager_functions'],
    allowedRoles: ['MANAGER', 'OWNER'],
    features: {
      canTakeOrders: true,
      canProcessPayments: true,
      canViewKitchen: true,
      canManageInventory: true,
      canAccessReports: true,
      canManageWorkers: true,
      canModifyPrices: true,
      canProcessRefunds: true,
      canOverrideDiscounts: true,
    },
  },
  
  [POSInterfaceType.CUSTOMER_KIOSK]: {
    type: POSInterfaceType.CUSTOMER_KIOSK,
    accessLevel: POSAccess.PUBLIC,
    requiredPermissions: [],
    allowedRoles: ['CUSTOMER'],
    deviceRequirements: {
      touchRequired: true,
      minScreenWidth: 1024,
      minScreenHeight: 768,
    },
    features: {
      canTakeOrders: true,
      canProcessPayments: true,
      canViewKitchen: false,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: false,
      canOverrideDiscounts: false,
    },
  },
  
  [POSInterfaceType.DRIVE_THRU]: {
    type: POSInterfaceType.DRIVE_THRU,
    accessLevel: POSAccess.WORKER_SESSION,
    requiredPermissions: ['pos:drive_thru'],
    allowedRoles: ['CASHIER', 'MANAGER'],
    features: {
      canTakeOrders: true,
      canProcessPayments: true,
      canViewKitchen: false,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: true,
      canOverrideDiscounts: true,
    },
  },
  
  [POSInterfaceType.MOBILE_POS]: {
    type: POSInterfaceType.MOBILE_POS,
    accessLevel: POSAccess.WORKER_SESSION,
    requiredPermissions: ['pos:mobile_access'],
    allowedRoles: ['SERVER', 'MANAGER'],
    deviceRequirements: {
      touchRequired: true,
    },
    features: {
      canTakeOrders: true,
      canProcessPayments: true,
      canViewKitchen: false,
      canManageInventory: false,
      canAccessReports: false,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: false,
      canOverrideDiscounts: false,
    },
  },
  
  [POSInterfaceType.INVENTORY_TERMINAL]: {
    type: POSInterfaceType.INVENTORY_TERMINAL,
    accessLevel: POSAccess.ROLE_RESTRICTED,
    requiredPermissions: ['inventory:manage'],
    allowedRoles: ['INVENTORY_MANAGER', 'MANAGER'],
    features: {
      canTakeOrders: false,
      canProcessPayments: false,
      canViewKitchen: false,
      canManageInventory: true,
      canAccessReports: true,
      canManageWorkers: false,
      canModifyPrices: false,
      canProcessRefunds: false,
      canOverrideDiscounts: false,
    },
  },
};

// Helper functions for POS interface management
export function getAvailableInterfaces(
  userRole: string, 
  permissions: string[], 
  deviceCapabilities?: any
): POSInterfaceType[] {
  return Object.values(POSInterfaceType).filter(interfaceType => {
    const config = POS_INTERFACE_CONFIGS[interfaceType];
    
    // Check role access
    if (!config.allowedRoles.includes(userRole) && !config.allowedRoles.includes('CUSTOMER')) {
      return false;
    }
    
    // Check permissions
    const hasRequiredPermissions = config.requiredPermissions.every(
      permission => permissions.includes(permission)
    );
    
    if (!hasRequiredPermissions) {
      return false;
    }
    
    // Check device requirements if provided
    if (config.deviceRequirements && deviceCapabilities) {
      // Add device capability checks here
    }
    
    return true;
  });
}

export function canAccessInterface(
  interfaceType: POSInterfaceType,
  userRole: string,
  permissions: string[],
  hasActiveSession: boolean = false
): boolean {
  const config = POS_INTERFACE_CONFIGS[interfaceType];
  
  // Check access level requirements
  switch (config.accessLevel) {
    case POSAccess.PUBLIC:
      return true;
    case POSAccess.WORKER_SESSION:
      return hasActiveSession;
    case POSAccess.ROLE_RESTRICTED:
      return config.allowedRoles.includes(userRole);
    case POSAccess.MANAGER_ONLY:
      return ['MANAGER', 'OWNER', 'ADMIN'].includes(userRole);
    case POSAccess.DEVICE_SPECIFIC:
      // Would need additional device validation
      return hasActiveSession;
    default:
      return false;
  }
}