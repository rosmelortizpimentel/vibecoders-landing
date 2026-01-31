import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Status {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  display_order: number;
}

export function useStatuses() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const { data, error } = await supabase
          .from('app_statuses')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setStatuses(data || []);
      } catch (err) {
        console.error('Error fetching statuses:', err);
        setError(err instanceof Error ? err : new Error('Error al cargar estados'));
      } finally {
        setLoading(false);
      }
    }

    fetchStatuses();
  }, []);

  return { statuses, loading, error };
}
