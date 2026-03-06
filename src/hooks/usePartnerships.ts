import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PartnershipApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  logo_url: string | null;
  partnership_types: string[];
  category: { id: string; name: string } | null;
  owner: {
    id: string;
    username: string;
    name: string;
    avatar_url: string | null;
  };
  created_at: string;
}

async function fetchPartnershipApps(): Promise<PartnershipApp[]> {
  const { data, error } = await supabase
    .from('apps')
    .select(`
      id, name, tagline, description, url, logo_url, partnership_types, created_at,
      owner:profiles!apps_user_id_fkey(id, username, name, avatar_url),
      category:app_categories(id, name)
    `)
    .eq('is_visible', true)
    .eq('open_to_partnerships', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as PartnershipApp[]) || [];
}

export function usePartnerships() {
  return useQuery({
    queryKey: ['partnership-apps'],
    queryFn: fetchPartnershipApps,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
