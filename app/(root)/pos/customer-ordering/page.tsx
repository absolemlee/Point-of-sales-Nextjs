import { Metadata } from 'next';
import { POSInterfaceRouter } from '@/components/pos/pos-interface-router';
import { UserContextProvider } from '@/lib/auth/user-context';
import { POSInterfaceType } from '@/types/pos-interfaces';

export const metadata: Metadata = {
  title: 'Customer Ordering | POS System',
  description: 'Customer self-service ordering interface',
};

interface CustomerOrderingPageProps {
  searchParams: {
    location?: string;
    mode?: 'kiosk' | 'mobile' | 'tablet';
  };
}

export default function CustomerOrderingPage({ searchParams }: CustomerOrderingPageProps) {
  const locationId = searchParams.location || 'loc-downtown-cafe';
  const mode = searchParams.mode || 'kiosk';

  return (
    <UserContextProvider>
      <POSInterfaceRouter 
        locationId={locationId}
        forceInterface={POSInterfaceType.CUSTOMER_ORDERING}
        mode={mode}
      />
    </UserContextProvider>
  );
}