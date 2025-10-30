/**
 * KavaPR Admin Demo Page
 * 
 * This page demonstrates the editable configuration system.
 */

'use client';

import React from 'react';
import { AdminConfigurationManager } from '@/components/admin/configuration-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDemoPage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>KavaPR Configuration Management Demo</CardTitle>
          <CardDescription>
            This interface allows you to edit and configure all aspects of the KavaPR system:
            roles, permissions, location types, and organizational settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600">✅ User Types</h3>
                <p className="text-sm text-muted-foreground">
                  Fully editable role system with 9+ role types
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600">✅ Permissions</h3>
                <p className="text-sm text-muted-foreground">
                  Fine-grained permission management
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600">✅ Locations</h3>
                <p className="text-sm text-muted-foreground">
                  Configurable location types (Static, Popup, Event, Venue)
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600">✅ Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Editable organizational structure
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdminConfigurationManager />
    </div>
  );
}