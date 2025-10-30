/**
 * Executive Location Management Page
 * Provides access to the CEO-level location oversight dashboard
 */

import React from 'react';
import { ExecutiveLocationDashboard } from '@/components/executive/executive-location-dashboard';

export default function ExecutiveLocationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <ExecutiveLocationDashboard />
    </div>
  );
}