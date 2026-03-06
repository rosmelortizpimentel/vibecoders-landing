import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  logo_url: string | null;
  partnership_types: string[];
  open_to_partnerships: boolean;
  beta_active: boolean;
  beta_mode: string;
  is_verified: boolean;
  category: { id: string; name: string } | null;
  status: { name: string; slug: string; color: string } | null;
  owner: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
  };
  app_founders: {
    role: string;
    profile: {
      id: string;
      username: string;
      name: string;
      avatar_url: string | null;
    };
  }[];
  created_at: string;
  screenshots: string[];
}

interface FetchAppsParams {
  pageParam?: number;
  searchQuery?: string;
  filter?: string;
  subFilter?: string;
}

async function fetchPublicApps({ 
  pageParam = 0, 
  searchQuery = '', 
  filter = 'all', 
  subFilter = 'all' 
}: FetchAppsParams): Promise<{ apps: PublicApp[], nextCursor: number | null }> {
  const isInitialPage = pageParam === 0;
  const PAGE_SIZE = isInitialPage ? 25 : 50;
  
  let query = supabase
    .from('apps')
    .select(`
      id, name, tagline, description, url, logo_url, partnership_types, 
      open_to_partnerships, beta_active, beta_mode, is_verified, created_at, screenshots,
      owner:profiles!apps_user_id_fkey(id, username, name, avatar_url),
      app_founders(role, profile:profiles(id, username, name, avatar_url)),
      category:app_categories(id, name),
      status:app_statuses(name, slug, color)
    `)
    .eq('is_visible', true);

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  if (filter === 'open-for-testing') {
    query = query.eq('beta_active', true);
  }

  if (filter === 'open-to-partnerships') {
    query = query.eq('open_to_partnerships', true);
    if (subFilter !== 'all') {
      query = query.contains('partnership_types', [subFilter]);
    }
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(pageParam, pageParam + PAGE_SIZE - 1);

  if (error) {
    throw new Error(error.message);
  }

  const apps = (data as unknown as PublicApp[]) || [];
  const nextCursor = apps.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null;

  return { apps, nextCursor };
}

export function usePublicApps(searchQuery: string = '', filter: string = 'all', subFilter: string = 'all') {
  return useInfiniteQuery({
    queryKey: ['public-apps', searchQuery, filter, subFilter],
    queryFn: ({ pageParam }) => fetchPublicApps({ pageParam, searchQuery, filter, subFilter }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// For backward compatibility and single fetch use cases
export function useAllPublicApps() {
  return useQuery({
    queryKey: ['all-public-apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          id, name, tagline, description, url, logo_url, partnership_types, 
          open_to_partnerships, beta_active, beta_mode, is_verified, created_at, screenshots,
          owner:profiles!apps_user_id_fkey(id, username, name, avatar_url),
          category:app_categories(id, name),
          status:app_statuses(name, slug, color)
        `)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as PublicApp[]) || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
