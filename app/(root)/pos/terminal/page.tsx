import { Metadata } from 'next';
import { POSInterfaceRouter } from '@/components/pos/pos-interface-router';
import { UserContextProvider } from '@/lib/auth/user-context';

export const metadata: Metadata = {
  title: 'POS Terminal | Point of Sale System',
  description: 'Location-specific POS terminal interface selector',
};

interface POSTerminalPageProps {
  searchParams: {
    location?: string;
  };
}

export default function POSTerminalPage({ searchParams }: POSTerminalPageProps) {
  const locationId = searchParams.location || 'loc-downtown-cafe';

  return (
    <UserContextProvider>
      <POSInterfaceRouter 
        locationId={locationId}
        mode="desktop"
      />
    </UserContextProvider>
  );
}