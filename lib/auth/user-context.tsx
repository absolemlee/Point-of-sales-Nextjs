'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { type User } from '@supabase/supabase-js';
import { KavaPRRole, LocationType } from '@/schema/kavap-r-types';

interface KavaPRUser extends User {
  role: KavaPRRole;
  locationType?: LocationType;
  locationId?: string;
  department?: string;
  managerId?: string;
  permissions: string[];
  isActive: boolean;
  name: string;
  username: string;
}

interface UserContextType {
  user: KavaPRUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, permission: string) => boolean;
  isInRole: (roles: KavaPRRole | KavaPRRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<KavaPRUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUserData = async (authUser: User): Promise<KavaPRUser | null> => {
    try {
      const { data: userData, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (error || !userData) {
        console.error('Failed to fetch user data:', error);
        return null;
      }

      return {
        ...authUser,
        role: userData.role as KavaPRRole,
        locationType: userData.locationType as LocationType,
        locationId: userData.locationId,
        department: userData.department,
        managerId: userData.managerId,
        permissions: userData.permissions || [],
        isActive: userData.isActive,
        name: userData.name,
        username: userData.username,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const kavaPRUser = await fetchUserData(authUser);
        setUser(kavaPRUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check for dev session (works in development regardless of NODE_ENV)
        try {
          const devSessionResponse = await fetch('/api/auth/dev-session');
          if (devSessionResponse.ok) {
            const devData = await devSessionResponse.json();
            if (devData.success && devData.user) {
              setUser(devData.user);
              setLoading(false);
              return;
            }
          }
        } catch (devError) {
          // Dev session check failed, continue to Supabase auth
          console.log('Dev session not available, falling back to Supabase');
        }

        // Fallback to Supabase auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const kavaPRUser = await fetchUserData(authUser);
          setUser(kavaPRUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const kavaPRUser = await fetchUserData(session.user);
          setUser(kavaPRUser);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      // Check for development credentials first (regardless of NODE_ENV)
      if (email === 'admin@admin.com' && password === 'admin') {
        console.log('Development login detected');
        // Use development login API
        const response = await fetch('/api/auth/dev-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: include cookies
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Dev login API response:', data);
        
        if (data.success) {
          // Create a mock KavaPR user for development
          const devUser: KavaPRUser = {
            id: 'dev-admin-001',
            email: 'admin@admin.com',
            role: KavaPRRole.SUPERADMIN,
            permissions: ['all'],
            isActive: true,
            name: 'Development Admin',
            username: 'dev-admin',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
          
          console.log('Setting dev user:', devUser);
          setUser(devUser);
          return {};
        } else {
          console.error('Dev login failed:', data.error);
          return { error: data.error || 'Development login failed' };
        }
      }

      console.log('Regular Supabase login for:', email);
      // Regular Supabase authentication for non-development users
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error.message);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('SignIn error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      // Clear development session if it exists
      if (process.env.NODE_ENV === 'development') {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      }
      
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasPermission = (resource: string, permission: string): boolean => {
    if (!user) return false;
    
    // SUPERADMIN has all permissions
    if (user.role === 'SUPERADMIN') return true;
    
    // Check specific permissions
    const permissionKey = `${resource}:${permission}`;
    return user.permissions.includes(permissionKey);
  };

  const isInRole = (roles: KavaPRRole | KavaPRRole[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: UserContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
    isInRole,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
}

// Role-based utility functions
export const roleHierarchy: Record<string, number> = {
  SUPERADMIN: 13,
  FULLADMIN: 12,
  OWNER: 11,
  ADMIN: 10,
  MANAGER: 9,
  SUPERVISOR: 8,
  COORDINATOR: 7,
  SPECIALIST: 6,
  ANALYST: 5,
  ASSISTANT: 4,
  INTERN: 3,
  CONTRACTOR: 2,
  WORKER: 2,
  UNKNOW: 1,
};

export function hasHigherRole(userRole: KavaPRRole, compareRole: KavaPRRole): boolean {
  return (roleHierarchy[userRole as string] || 0) > (roleHierarchy[compareRole as string] || 0);
}

export function hasEqualOrHigherRole(userRole: KavaPRRole, compareRole: KavaPRRole): boolean {
  return (roleHierarchy[userRole as string] || 0) >= (roleHierarchy[compareRole as string] || 0);
}

export function canManageUser(managerRole: KavaPRRole, targetRole: KavaPRRole): boolean {
  // SUPERADMIN can manage anyone
  if (managerRole === 'SUPERADMIN') return true;
  
  // FULLADMIN can manage everyone except SUPERADMIN
  if (managerRole === 'FULLADMIN' && targetRole !== 'SUPERADMIN') return true;
  
  // OWNER can manage everyone except SUPERADMIN and FULLADMIN
  if (managerRole === 'OWNER' && !['SUPERADMIN', 'FULLADMIN'].includes(targetRole)) return true;
  
  // Others can only manage lower roles
  return hasHigherRole(managerRole, targetRole);
}

// Simple PermissionGate component
interface PermissionGateProps {
  children: React.ReactNode;
  resource?: string;
  permission?: string;
  roles?: KavaPRRole | KavaPRRole[];
  fallback?: React.ReactNode;
}

export function PermissionGate({ 
  children, 
  resource, 
  permission, 
  roles, 
  fallback = null 
}: PermissionGateProps) {
  const { user, hasPermission, isInRole } = useUser();

  if (!user) return fallback;

  // Check role-based access
  if (roles && !isInRole(roles)) return fallback;

  // Check permission-based access
  if (resource && permission && !hasPermission(resource, permission)) return fallback;

  return <>{children}</>;
}