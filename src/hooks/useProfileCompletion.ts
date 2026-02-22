 import { useAuth } from './useAuth';
 import { useQuery, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 
 export interface ChecklistItem {
   key: 'name' | 'avatar' | 'tagline' | 'social' | 'app';
   label: string;
   completed: boolean;
 }
 
 interface ProfileCompletionResult {
   percentage: number;
   isComplete: boolean;
   checklist: ChecklistItem[];
   loading: boolean;
 }
 
 const SOCIAL_FIELDS = [
   'lovable',
   'twitter',
   'github',
   'tiktok',
   'instagram',
   'youtube',
   'linkedin',
   'email_public',
 ] as const;
 
 export function useProfileCompletion(): ProfileCompletionResult {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const { data, isLoading } = useQuery({
     queryKey: ['profile-completion', user?.id],
     queryFn: async () => {
       if (!user) return null;
 
       // Use the cached profile if available, or fetch it
       const profile = await queryClient.fetchQuery({
         queryKey: ['profile', user.id],
         queryFn: async () => {
           const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
           if (error) throw error;
           return data;
         },
         staleTime: 0,
       });
 
       // Fetch apps count
       const { count, error: appsError } = await supabase
         .from('apps')
         .select('id', { count: 'exact', head: true })
         .eq('user_id', user.id);
 
       if (appsError) throw appsError;
 
       return { profile, appsCount: count || 0 };
     },
     enabled: !!user,
     staleTime: 0,
     gcTime: 0,
   });
 
   if (!user || isLoading || !data) {
     return {
       percentage: 0,
       isComplete: false,
       checklist: [],
       loading: isLoading,
     };
   }
 
   const { profile, appsCount } = data;
 
   // Calculate checklist
   const hasName = !!profile?.name?.trim();
   const hasAvatar = !!profile?.avatar_url?.trim();
   const hasTagline = !!profile?.tagline?.trim();
   const hasSocial = SOCIAL_FIELDS.some(
     (field) => !!(profile as Record<string, string | null>)?.[field]?.trim()
   );
   const hasApp = appsCount > 0;
 
   const checklist: ChecklistItem[] = [
     { key: 'name', label: 'Nombre', completed: hasName },
     { key: 'avatar', label: 'Avatar', completed: hasAvatar },
     { key: 'tagline', label: 'Tagline', completed: hasTagline },
     { key: 'social', label: 'Al menos una red social', completed: hasSocial },
     { key: 'app', label: 'Tu primera app', completed: hasApp },
   ];
 
   const completedCount = checklist.filter((item) => item.completed).length;
   const percentage = (completedCount / checklist.length) * 100;
 
   return {
     percentage,
     isComplete: percentage === 100,
     checklist,
     loading: false,
   };
 }