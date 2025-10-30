import { Metadata } from 'next';
import { UserProfileSettings } from '@/components/user/user-profile-settings';
import { UserContextProvider } from '@/lib/auth/user-context';

export const metadata: Metadata = {
  title: 'Profile Settings | KavaPR POS',
  description: 'Manage your account settings and preferences',
};

export default function ProfileSettingsPage() {
  return (
    <UserContextProvider>
      <UserProfileSettings />
    </UserContextProvider>
  );
}