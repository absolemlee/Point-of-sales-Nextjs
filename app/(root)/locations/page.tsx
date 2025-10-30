'use client';

import { useState } from 'react';
import { IntegratedLocationDashboard } from '@/components/locations/integrated-location-dashboard';
import { EnhancedLocationManagement } from '@/components/locations/enhanced-location-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Store } from 'lucide-react';

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="management" className="w-full">
        <div className="border-b bg-white px-6 py-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>POS Management</span>
            </TabsTrigger>
            <TabsTrigger value="executive" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Executive View</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="management" className="mt-0">
          <EnhancedLocationManagement />
        </TabsContent>
        
        <TabsContent value="executive" className="mt-0">
          <IntegratedLocationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}