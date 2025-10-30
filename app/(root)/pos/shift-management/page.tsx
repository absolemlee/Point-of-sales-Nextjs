import { Metadata } from 'next';
import { ShiftDashboard } from '@/components/shift/shift-dashboard';
import { UserContextProvider } from '@/lib/auth/user-context';

export const metadata: Metadata = {
  title: 'Shift Management | KavaPR Point of Sale',
  description: 'Comprehensive shift management dashboard for location-based operations',
};

interface ShiftManagementPageProps {
  searchParams: {
    location?: string;
  };
}

export default function ShiftManagementPage({ searchParams }: ShiftManagementPageProps) {
  // Default to downtown cafe if no location specified
  const locationId = searchParams.location || 'loc-downtown-cafe';

  return (
    <UserContextProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="border-b bg-white dark:bg-gray-900">
          <div className="container mx-auto py-6 px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
                <p className="text-muted-foreground mt-1">
                  Comprehensive shift operations and worker management
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Location: <span className="font-medium">{locationId}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-6">
          <ShiftDashboard 
            locationId={locationId}
            userRole="MANAGER"
            userPermissions={[
              'shift:manage', 
              'worker:assign', 
              'pos:admin', 
              'reports:view'
            ]}
          />
        </div>
      </div>
    </UserContextProvider>
  );
}