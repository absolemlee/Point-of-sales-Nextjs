import React from 'react';
import { SystemAdministrationPanel } from '@/components/admin/system-administration-panel';

export const metadata = {
  title: 'System Administration | SuperAdmin Panel',
  description: 'Complete system administration and monitoring dashboard',
};

export default function AdminDashboardPage() {
  return <SystemAdministrationPanel />;
}