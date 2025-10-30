'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/auth/user-context';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">KavaPR Management System</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Advanced Point of Sales and Business Management Platform
        </p>
        <div className="space-x-4">
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
          <Button variant="outline" onClick={() => router.push('/register')}>
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}
