import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TesterProfile {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
}

export interface BetaTester {
  id: string;
  user_id: string;
  joined_at: string;
  feedback_count: number;
  profile: TesterProfile;
}

export interface AppOwner {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
}

export interface AppCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface AppStatus {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

export interface TechStack {
  id: string;
  name: string;
  logo_url: string;
}

export interface AppDetailData {
  id: string;
  url: string;
  name: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  hours_ideation: number | null;
  hours_building: number | null;
  beta_active: boolean;
  beta_mode: string;
  beta_limit: number;
  beta_link: string | null;
  beta_instructions: string | null;
  owner: AppOwner;
  category: AppCategory | null;
  status: AppStatus | null;
  stacks: TechStack[];
  screenshots: string[];
  tags: string[];
  testers_count: number;
  testers: BetaTester[];
  user_tester_status: { status: string; id: string } | null;
  is_owner: boolean;
  likes_count: number;
  user_liked: boolean;
}

export function useAppDetail(appId: string | undefined) {
  const { user } = useAuth();
  const [app, setApp] = useState<AppDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppDetail = useCallback(async () => {
    if (!appId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth header if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('get-app-detail', {
        body: null,
        headers,
      });

      // Since we're using query params, we need to call differently
      const response = await fetch(
        `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/get-app-detail?app_id=${appId}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch app');
      }

      const appData = await response.json();
      setApp(appData);
    } catch (err) {
      console.error('Error fetching app detail:', err);
      setError(err instanceof Error ? err.message : 'Error loading app');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchAppDetail();
  }, [fetchAppDetail]);

  return {
    app,
    loading,
    error,
    refetch: fetchAppDetail,
  };
}