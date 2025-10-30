'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useUser } from '@/lib/auth/user-context';
import { KavaPRRole } from '@/schema/kavap-r-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor,
  Shield,
  MapPin,
  Clock,
  Palette
} from 'lucide-react';

export function UserProfileAvatar() {
  const { user, signOut, loading } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/auth/login">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </a>
      </Button>
    );
  }



  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'SUPERADMIN': 'bg-red-500',
      'FULLADMIN': 'bg-orange-500',
      'ADMIN': 'bg-blue-500',
      'MANAGER': 'bg-green-500',
      'SUPERVISOR': 'bg-purple-500',
      'COORDINATOR': 'bg-pink-500',
      'SPECIALIST': 'bg-cyan-500',
      'ANALYST': 'bg-indigo-500',
      'ASSISTANT': 'bg-yellow-500',
      'INTERN': 'bg-gray-500',
      'CONTRACTOR': 'bg-teal-500',
      'OWNER': 'bg-gold-500',
      'WORKER': 'bg-slate-500'
    };
    return colorMap[role] || 'bg-gray-500';
  };

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={undefined} alt={user.name} />
            <AvatarFallback className={`${getRoleColor(user.role)} text-white font-medium`}>
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={undefined} alt={user.name} />
                <AvatarFallback className={`${getRoleColor(user.role)} text-white font-medium`}>
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
              {user.locationId && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Location
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Profile Management */}
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        
        {/* Time Tracking (for workers) */}
        {(user.role === KavaPRRole.WORKER || user.role === KavaPRRole.ASSISTANT || user.role === KavaPRRole.INTERN || user.role === KavaPRRole.CONTRACTOR) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Clock className="mr-2 h-4 w-4" />
              <span>Time & Attendance</span>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Theme Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Appearance</span>
            <div className="ml-auto">
              {getThemeIcon(theme || 'system')}
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
              {theme === 'light' && <div className="ml-auto h-2 w-2 rounded-full bg-current" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {theme === 'dark' && <div className="ml-auto h-2 w-2 rounded-full bg-current" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
              {theme === 'system' && <div className="ml-auto h-2 w-2 rounded-full bg-current" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {/* Sign Out */}
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}