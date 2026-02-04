import { useParams, Navigate } from 'react-router-dom';
import { ProfileNavigator } from '@/components/profile/ProfileNavigator';

export default function PublicProfile() {
  const { handle } = useParams<{ handle: string }>();

  // Validate: must start with @ to be a public profile
  if (!handle || !handle.startsWith('@')) {
    return <Navigate to="/" replace />;
  }

  // Extract username without the @ prefix
  const username = handle.slice(1);

  return <ProfileNavigator initialUsername={username} />;
}
