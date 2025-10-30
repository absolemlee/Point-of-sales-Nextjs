import { Metadata } from 'next';
import { EnhancedMultiLocationPOS } from '@/components/pos/enhanced-multi-location-pos';
import { UserContextProvider } from '@/lib/auth/user-context';

export const metadata: Metadata = {
  title: 'Multi-Location POS | Point of Sale System',
  description: 'Comprehensive multi-location POS management and control center',
};

export default function MultiLocationPOSPage() {
  return (
    <UserContextProvider>
      <div className="container mx-auto py-6 px-4">
        <EnhancedMultiLocationPOS />
      </div>
    </UserContextProvider>
  );
}