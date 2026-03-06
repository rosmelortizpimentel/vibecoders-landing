import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AppLikeInfo {
  app_id: string;
  likes_count: number;
  is_liked: boolean;
}

export interface TopAppEntry {
  app_id: string;
  name: string;
  logo_url: string | null;
  likes_count: number;
  founders: {
    id: string;
    name: string;
    username: string;
    avatar_url: string | null;
    is_owner: boolean;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, params?: Record<string, unknown>) => (supabase.rpc as any)(name, params);

export function useAppLikesBatch(appIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['app-likes-batch', appIds.sort().join(','), user?.id],
    queryFn: async (): Promise<Record<string, AppLikeInfo>> => {
      if (!appIds.length) return {};

      const { data, error } = await rpc('get_app_likes_batch', {
        app_ids: appIds,
        p_user_id: user?.id || null,
      });

      if (error) throw error;

      const map: Record<string, AppLikeInfo> = {};
      (data as AppLikeInfo[])?.forEach((row: AppLikeInfo) => {
        map[row.app_id] = row;
      });
      return map;
    },
    enabled: appIds.length > 0,
    staleTime: 1000 * 30,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['app-likes-batch'] });
    queryClient.invalidateQueries({ queryKey: ['top-apps'] });
  };

  return { likesMap: data || {}, isLoading, invalidate };
}

export function useTopApps(period: 'week' | 'month' | 'all') {
  return useQuery({
    queryKey: ['top-apps', period],
    queryFn: async () => {
      const { data, error } = await rpc('get_top_apps', { period });
      if (error) throw error;
      return (data as TopAppEntry[]) || [];
    },
    staleTime: 1000 * 60 * 2,
  });
}
