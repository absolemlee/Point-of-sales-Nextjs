import { Metadata } from 'next';
import { POSInterfaceRouter } from '@/components/pos/pos-interface-router';
import { UserContextProvider } from '@/lib/auth/user-context';
import { POSInterfaceType } from '@/types/pos-interfaces';

export const metadata: Metadata = {
  title: 'Manager Terminal | POS System',
  description: 'Manager dashboard with full access controls',
};

interface ManagerTerminalPageProps {
  searchParams: {
    location?: string;
  };
}

export default function ManagerTerminalPage({ searchParams }: ManagerTerminalPageProps) {
  const locationId = searchParams.location || 'loc-downtown-cafe';

  return (
    <UserContextProvider>
      <POSInterfaceRouter 
        locationId={locationId}
        forceInterface={POSInterfaceType.MANAGER_TERMINAL}
        mode="desktop"
      />
    </UserContextProvider>
  );
}