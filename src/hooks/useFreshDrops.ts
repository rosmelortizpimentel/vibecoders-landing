 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useGeneralSettings } from './useGeneralSettings';
 import type { ShowcaseProject } from './useShowcase';
 
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
         .from('showcase_gallery')
         .select('*')
         .eq('is_active', true)
         .order('created_at', { ascending: false })
         .limit(freshDropsCount);
 
       if (error) throw new Error(error.message);
       return (data as unknown as ShowcaseProject[]) || [];
     },
     enabled: !settingsLoading,
     staleTime: 1000 * 60 * 5,
   });
 }