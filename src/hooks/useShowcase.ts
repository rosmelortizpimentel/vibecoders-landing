import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ShowcaseProject {
  id: string;
  project_title: string;
  project_tagline: string;
  project_url: string;
  project_thumbnail: string;
  project_logo_url: string | null;
  author_name: string;
  author_avatar: string | null;
  author_linkedin: string | null;
  author_twitter: string | null;
  author_website: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

async function fetchShowcaseProjects(): Promise<ShowcaseProject[]> {
  const { data, error } = await supabase
    .from('showcase_gallery')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as ShowcaseProject[]) || [];
}

export function useShowcase() {
  return useQuery({
    queryKey: ['showcase-gallery'],
    queryFn: fetchShowcaseProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
