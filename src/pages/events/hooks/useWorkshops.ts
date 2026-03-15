import { useState, useEffect } from 'react';
import { fetchConfirmedWorkshops } from '../supabaseEvents';
import type { Workshop } from '../types';

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfirmedWorkshops().then((data) => {
      const sorted = [...data].sort((a, b) => {
        const aDate = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity;
        const bDate = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity;
        return aDate - bDate;
      });
      setWorkshops(sorted);
      setLoading(false);
    });
  }, []);

  return { workshops, loading };
}
