 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useGeneralSettings } from './useGeneralSettings';
 
 export interface FreshDropApp {
   id: string;
   name: string | null;
   tagline: string | null;
   url: string;
   logo_url: string | null;
  is_verified: boolean;
   created_at: string;
   profiles: {
     username: string | null;
     name: string | null;
     avatar_url: string | null;
   } | null;
 }
 
 export function useFreshDrops() {
   const { data: settings, isLoading: settingsLoading } = useGeneralSettings();
   
   const freshDropsCount = parseInt(
     settings?.find(s => s.key === 'fresh_drops_count')?.value || '5',
     10
   );
 
   return useQuery({
     queryKey: ['fresh-drops', freshDropsCount],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('apps')
         .select(`
           id,
           name,
           tagline,
           url,
           logo_url,
           created_at,
            is_verified,
           profiles:user_id (
             username,
             name,
             avatar_url
           )
         `)
         .eq('is_visible', true)
         .order('created_at', { ascending: false })
         .limit(freshDropsCount);
 
       if (error) throw new Error(error.message);
       return (data as unknown as FreshDropApp[]) || [];
     },
     enabled: !settingsLoading,
     staleTime: 1000 * 60 * 5,
   });
 }