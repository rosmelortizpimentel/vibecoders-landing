import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface MyFeedback {
  id: string;
  app_id: string;
  type: string;
  content: string;
  status: string;
  created_at: string;
  app: {
    name: string;
    logo_url: string | null;
  };
}

export function useMyFeedback() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-feedback', user?.id],
    queryFn: async (): Promise<MyFeedback[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('beta_feedback')
        .select(`
          id,
          app_id,
          type,
          content,
          status,
          created_at,
          app:apps (
            name,
            logo_url
          )
        `)
        .eq('tester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(f => ({
        ...f,
        app: f.app as unknown as { name: string; logo_url: string | null }
      })) as MyFeedback[];
    },
    enabled: !!user,
  });
}
