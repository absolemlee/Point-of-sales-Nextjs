import React from 'react';
import { SuperAdminBentoGrid } from '@/components/admin/superadmin-bento-grid';
import ErrorBoundary from '@/components/toaster/toaster';

const page = () => {
  return (
    <div className="w-full">
      <ErrorBoundary>
        <SuperAdminBentoGrid />
      </ErrorBoundary>
    </div>
  );
};

export default page;
