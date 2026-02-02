import { useState, useEffect } from 'react';

export interface PublicAppStack {
  id: string;
  name: string;
  logo_url: string;
}

export interface PublicApp {
  id: string;
  url: string;
  name: string | null;
  tagline: string | null;
  logo_url: string | null;
  status: { name: string; slug: string } | null;
  stacks: PublicAppStack[];
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  avatar_position: 'left' | 'center' | 'right' | null;
  banner_url: string | null;
  banner_position: 'left' | 'center' | 'right' | null;
  name: string | null;
  tagline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  accent_color: string | null;
  font_family: string | null;
  member_number: number;
  is_pioneer: boolean;
  show_pioneer_badge: boolean;
  // Socials
  lovable: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  email_public: string | null;
  // Apps
  apps: PublicApp[];
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
