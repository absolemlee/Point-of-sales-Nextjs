import { Metadata } from 'next';
import { POSInterfaceRouter } from '@/components/pos/pos-interface-router';
import { UserContextProvider } from '@/lib/auth/user-context';
import { POSInterfaceType } from '@/types/pos-interfaces';

export const metadata: Metadata = {
  title: 'Payment Terminal | POS System',
  description: 'Dedicated payment processing interface',
};

interface PaymentTerminalPageProps {
  searchParams: {
    location?: string;
    station?: string;
  };
}

export default function PaymentTerminalPage({ searchParams }: PaymentTerminalPageProps) {
  const locationId = searchParams.location || 'loc-downtown-cafe';

  return (
    <UserContextProvider>
      <POSInterfaceRouter 
        locationId={locationId}
        forceInterface={POSInterfaceType.PAYMENT_TERMINAL}
        mode="desktop"
      />
    </UserContextProvider>
  );
}