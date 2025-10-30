import React from 'react';
import { DeviceManagementDashboard } from '@/components/admin/devices/device-management-dashboard';

export const metadata = {
  title: 'Device Management | Admin Panel',
  description: 'Manage and monitor all POS devices across your network',
};

export default function DeviceManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <DeviceManagementDashboard />
    </div>
  );
}