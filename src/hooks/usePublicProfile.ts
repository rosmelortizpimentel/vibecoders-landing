import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  username: string;
  avatar_url: string | null;
  first_name: string;
}

interface UsePublicProfileResult {
  profile: PublicProfile | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function usePublicProfile(username: string | undefined): UsePublicProfileResult {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchPublicProfile = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const response = await fetch(
          `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/get-public-profile?username=${encodeURIComponent(username)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const result = await response.json();

        if (!result.success) {
          if (result.error === 'Profile not found' || result.error === 'User not found') {
            setNotFound(true);
          } else {
            setError(result.error || 'Error loading profile');
          }
          setProfile(null);
        } else {
          setProfile(result.profile);
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  return { profile, loading, error, notFound };
}
