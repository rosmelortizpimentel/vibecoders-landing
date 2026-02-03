import { ProfileData } from '@/hooks/useProfileEditor';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';

interface MeHeaderProps {
  profile: ProfileData | null;
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  onSignOut: () => void;
}

export function MeHeader({ profile, isSaving, lastSaved, error, onSignOut }: MeHeaderProps) {
  return (
    <AuthenticatedHeader
      profile={profile}
      onSignOut={onSignOut}
      isSaving={isSaving}
      lastSaved={lastSaved}
      error={error}
    />
  );
}
