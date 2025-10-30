/**
 * KavaPR User-Based Router
 * 
 * This handles dynamic routing based on user roles and provides
 * role-appropriate navigation and access control.
 */

import { KavaPRRole, LocationType } from '@/schema/kavap-r-types';

export interface RouteConfig {
  path: string;
  allowedRoles: KavaPRRole[];
  requiredPermissions?: string[];
  locationTypes?: LocationType[];
  redirectIfNoAccess?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
}

// ========================================
// ROLE-BASED ROUTE DEFINITIONS
// ========================================

export const ROLE_ROUTES: Record<KavaPRRole, string> = {
  // Top-tier administrative roles
  [KavaPRRole.SUPERADMIN]: '/dashboard/executive',
  [KavaPRRole.FULLADMIN]: '/dashboard/executive',
  [KavaPRRole.ADMIN]: '/dashboard/admin',
  
  // Management hierarchy
  [KavaPRRole.MANAGER]: '/dashboard/manager',
  [KavaPRRole.SUPERVISOR]: '/dashboard/supervisor',
  [KavaPRRole.COORDINATOR]: '/dashboard/coordinator',
  
  // Specialized roles
  [KavaPRRole.SPECIALIST]: '/dashboard/specialist',
  [KavaPRRole.ANALYST]: '/dashboard/analyst',
  [KavaPRRole.ASSISTANT]: '/dashboard/assistant',
  
  // Entry level and temporary
  [KavaPRRole.INTERN]: '/dashboard/staff',
  [KavaPRRole.CONTRACTOR]: '/dashboard/staff',
  
  // Legacy compatibility roles
  [KavaPRRole.OWNER]: '/dashboard/executive',
  [KavaPRRole.WORKER]: '/dashboard/staff',
  [KavaPRRole.UNKNOW]: '/dashboard/staff'
};

// ========================================
// PROTECTED ROUTES CONFIGURATION
// ========================================

export const PROTECTED_ROUTES: RouteConfig[] = [
  // Executive & Admin Routes
  {
    path: '/dashboard/executive',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.OWNER],
    redirectIfNoAccess: '/unauthorized'
  },
  {
    path: '/dashboard/admin',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN],
    redirectIfNoAccess: '/dashboard/staff'
  },
  
  // Management Routes
  {
    path: '/dashboard/manager',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN, KavaPRRole.MANAGER],
    redirectIfNoAccess: '/dashboard/staff'
  },
  {
    path: '/dashboard/supervisor',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN, KavaPRRole.MANAGER, KavaPRRole.SUPERVISOR],
    redirectIfNoAccess: '/dashboard/staff'
  },
  {
    path: '/dashboard/coordinator',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN, KavaPRRole.MANAGER, KavaPRRole.SUPERVISOR, KavaPRRole.COORDINATOR],
    redirectIfNoAccess: '/dashboard/staff'
  },
  
  // Specialized Routes
  {
    path: '/dashboard/specialist',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN, KavaPRRole.SPECIALIST],
    redirectIfNoAccess: '/dashboard/staff'
  },
  {
    path: '/dashboard/analyst',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN, KavaPRRole.ANALYST],
    redirectIfNoAccess: '/dashboard/staff'
  },
  {
    path: '/dashboard/assistant',
    allowedRoles: [KavaPRRole.SUPERADMIN, KavaPRRole.FULLADMIN, KavaPRRole.ADMIN, KavaPRRole.ASSISTANT],
    redirectIfNoAccess: '/dashboard/staff'
  },
  
  // General Staff Routes
  {
    path: '/dashboard/staff',
    allowedRoles: Object.values(KavaPRRole), // All roles can access staff dashboard
    redirectIfNoAccess: '/unauthorized'
  },
  
  // POS System Routes
  {
    path: '/pos/multi-location',
    allowedRoles: [
      KavaPRRole.SUPERADMIN, 
      KavaPRRole.FULLADMIN, 
      KavaPRRole.ADMIN, 
      KavaPRRole.MANAGER, 
      KavaPRRole.OWNER
    ],
    redirectIfNoAccess: '/pos/terminal'
  },
  {
    path: '/pos/terminal',
    allowedRoles: Object.values(KavaPRRole).filter(role => role !== KavaPRRole.UNKNOW), // All authenticated roles
    redirectIfNoAccess: '/unauthorized'
  },
  {
    path: '/pos/shift-management',
    allowedRoles: [
      KavaPRRole.SUPERADMIN, 
      KavaPRRole.FULLADMIN, 
      KavaPRRole.ADMIN, 
      KavaPRRole.MANAGER, 
      KavaPRRole.SUPERVISOR,
      KavaPRRole.COORDINATOR
    ],
    redirectIfNoAccess: '/pos/terminal'
  },
  {
    path: '/pos',
    allowedRoles: Object.values(KavaPRRole).filter(role => role !== KavaPRRole.UNKNOW), // All authenticated roles
    redirectIfNoAccess: '/unauthorized'
  },
  
  // User Profile Routes
  {
    path: '/profile',
    allowedRoles: Object.values(KavaPRRole).filter(role => role !== KavaPRRole.UNKNOW), // All authenticated roles
    redirectIfNoAccess: '/unauthorized'
  }
];

// ========================================
// ROLE-BASED NAVIGATION
// ========================================

const commonNavigation: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Products', path: '/product', icon: 'box' },
  { label: 'Orders', path: '/orders', icon: 'shopping-cart' },
  { label: 'Records', path: '/records', icon: 'file-text' }
];

const posNavigation: NavigationItem[] = [
  ...commonNavigation,
  { 
    label: 'POS System', 
    path: '/pos', 
    icon: 'credit-card',
    children: [
      { label: 'Multi-Location', path: '/pos/multi-location', icon: 'map-pin' },
      { label: 'Terminal', path: '/pos/terminal', icon: 'monitor' },
      { label: 'Shift Management', path: '/pos/shift-management', icon: 'clock' }
    ]
  }
];

const managementNavigation: NavigationItem[] = [
  ...posNavigation,
  { label: 'Analytics', path: '/analytics', icon: 'bar-chart' },
  { label: 'Settings', path: '/settings', icon: 'settings' }
];

const executiveNavigation: NavigationItem[] = [
  ...managementNavigation,
  { label: 'All Locations', path: '/dashboard/executive/all-locations', icon: 'map-pin' },
  { label: 'System Admin', path: '/dashboard/executive/admin', icon: 'shield' }
];

export const ROLE_NAVIGATION: Record<KavaPRRole, NavigationItem[]> = {
  // Executive level navigation
  [KavaPRRole.SUPERADMIN]: executiveNavigation,
  [KavaPRRole.FULLADMIN]: executiveNavigation,
  [KavaPRRole.OWNER]: executiveNavigation,
  
  // Administrative navigation
  [KavaPRRole.ADMIN]: managementNavigation,
  
  // Management navigation
  [KavaPRRole.MANAGER]: managementNavigation,
  [KavaPRRole.SUPERVISOR]: managementNavigation,
  [KavaPRRole.COORDINATOR]: managementNavigation,
  
  // Specialized navigation
  [KavaPRRole.SPECIALIST]: posNavigation,
  [KavaPRRole.ANALYST]: [...posNavigation, { label: 'Analytics', path: '/analytics', icon: 'bar-chart' }],
  [KavaPRRole.ASSISTANT]: posNavigation,
  
  // Entry level navigation  
  [KavaPRRole.INTERN]: posNavigation,
  [KavaPRRole.CONTRACTOR]: posNavigation,
  
  // Default/legacy navigation
  [KavaPRRole.WORKER]: posNavigation,
  [KavaPRRole.UNKNOW]: commonNavigation
};

// ========================================
// ROUTER UTILITIES
// ========================================

export function getUserDefaultRoute(role: KavaPRRole): string {
  return ROLE_ROUTES[role] || '/dashboard/staff';
}

export function canAccessRoute(userRole: KavaPRRole, path: string): boolean {
  const route = PROTECTED_ROUTES.find(r => r.path === path);
  if (!route) return true; // Public route
  
  return route.allowedRoles.includes(userRole);
}

export function getRedirectRoute(userRole: KavaPRRole, attemptedPath: string): string {
  const route = PROTECTED_ROUTES.find(r => r.path === attemptedPath);
  if (!route) return attemptedPath; // Public route
  
  if (route.allowedRoles.includes(userRole)) {
    return attemptedPath; // User has access
  }
  
  return route.redirectIfNoAccess || getUserDefaultRoute(userRole);
}

export function getUserNavigation(role: KavaPRRole): NavigationItem[] {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION[KavaPRRole.UNKNOW];
}

export function hasRoleHierarchy(userRole: KavaPRRole, requiredRole: KavaPRRole): boolean {
  const roleHierarchy = [
    KavaPRRole.SUPERADMIN,
    KavaPRRole.FULLADMIN,
    KavaPRRole.ADMIN,
    KavaPRRole.MANAGER,
    KavaPRRole.SUPERVISOR,
    KavaPRRole.COORDINATOR,
    KavaPRRole.SPECIALIST,
    KavaPRRole.ANALYST,
    KavaPRRole.ASSISTANT,
    KavaPRRole.INTERN,
    KavaPRRole.CONTRACTOR,
    KavaPRRole.WORKER,
    KavaPRRole.UNKNOW
  ];
  
  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);
  
  return userIndex <= requiredIndex; // Lower index = higher privilege
}

export function getLocationBasedAccess(
  userRole: KavaPRRole, 
  locationType: LocationType
): boolean {
  // Superadmin and Fulladmin have access to all location types
  if (userRole === KavaPRRole.SUPERADMIN || userRole === KavaPRRole.FULLADMIN) {
    return true;
  }
  
  // Admin and Manager have access to most location types
  if (userRole === KavaPRRole.ADMIN || userRole === KavaPRRole.MANAGER) {
    return [LocationType.STATIC, LocationType.POPUP, LocationType.VENUE_PARTNERSHIP].includes(locationType);
  }
  
  // Other roles have limited access
  return locationType === LocationType.STATIC;
}