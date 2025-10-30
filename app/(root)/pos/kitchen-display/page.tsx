import { Metadata } from 'next';
import { POSInterfaceRouter } from '@/components/pos/pos-interface-router';
import { UserContextProvider } from '@/lib/auth/user-context';
import { POSInterfaceType } from '@/types/pos-interfaces';

export const metadata: Metadata = {
  title: 'Kitchen Display | POS System',
  description: 'Kitchen order management and tracking interface',
};

interface KitchenDisplayPageProps {
  searchParams: {
    location?: string;
    station?: string;
  };
}

export default function KitchenDisplayPage({ searchParams }: KitchenDisplayPageProps) {
  const locationId = searchParams.location || 'loc-downtown-cafe';

  return (
    <UserContextProvider>
      <POSInterfaceRouter 
        locationId={locationId}
        forceInterface={POSInterfaceType.KITCHEN_DISPLAY}
        mode="desktop"
      />
    </UserContextProvider>
  );
}