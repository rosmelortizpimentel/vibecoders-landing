import { useState, useEffect, useCallback } from 'react';
import { recordStandVisit, fetchStandVisits } from '../supabaseEvents';
import { LOCALSTORAGE_KEYS } from '../constants';

export function useStandVisits(deviceId: string | null) {
  const [visitedIds, setVisitedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEYS.visits);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    if (!deviceId) return;
    fetchStandVisits(deviceId).then((ids) => {
      setVisitedIds((prev) => {
        const merged = Array.from(new Set([...prev, ...ids]));
        localStorage.setItem(LOCALSTORAGE_KEYS.visits, JSON.stringify(merged));
        return merged;
      });
    });
  }, [deviceId]);

  const visit = useCallback(async (workshopId: string) => {
    if (!deviceId) return;
    if (visitedIds.includes(workshopId)) return;
    await recordStandVisit(deviceId, workshopId);
    setVisitedIds((prev) => {
      const next = [...prev, workshopId];
      localStorage.setItem(LOCALSTORAGE_KEYS.visits, JSON.stringify(next));
      return next;
    });
  }, [deviceId, visitedIds]);

  return { visitedIds, visit };
}
