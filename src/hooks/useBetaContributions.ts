import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BetaContribution {
  id: string;
  app_id: string;
  joined_at: string;
  feedback_count: number;
  app: {
    id: string;
    name: string | null;
    logo_url: string | null;
    url: string;
  };
}

export function useBetaContributions(userId: string | undefined) {
  const [contributions, setContributions] = useState<BetaContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
      try {
        const { data, error } = await supabase
          .from('beta_testers')
          .select(`
            id,
            app_id,
            joined_at,
            feedback_count,
            app:apps!beta_testers_app_id_fkey(id, name, logo_url, url)
          `)
          .eq('user_id', userId)
          .eq('status', 'accepted')
          .order('joined_at', { ascending: false });

        if (error) throw error;
        
        setContributions((data || []) as unknown as BetaContribution[]);
      } catch (err) {
        console.error('Error fetching beta contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  return { contributions, loading };
}