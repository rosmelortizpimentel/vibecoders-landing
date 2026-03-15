import { useState, useCallback } from 'react';
import { BADGES, LOCALSTORAGE_KEYS } from '../constants';
import type { BadgeType } from '../types';

export function useBadges() {
  const [earned, setEarned] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEYS.badges);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [pendingBadge, setPendingBadge] = useState<BadgeType | null>(null);

  const checkBadges = useCallback((visitedCount: number, totalStands: number, steps: number) => {
    const newBadges: string[] = [];

    if (visitedCount >= 1 && !earned.includes('first_visit')) {
      newBadges.push('first_visit');
    }
    if (totalStands > 0 && visitedCount >= Math.ceil(totalStands / 2) && !earned.includes('halfway')) {
      newBadges.push('halfway');
    }
    if (totalStands > 0 && visitedCount >= totalStands && !earned.includes('complete')) {
      newBadges.push('complete');
    }
    if (steps >= 500 && !earned.includes('walker')) {
      newBadges.push('walker');
    }

    if (newBadges.length > 0) {
      const updated = [...earned, ...newBadges];
      setEarned(updated);
      localStorage.setItem(LOCALSTORAGE_KEYS.badges, JSON.stringify(updated));
      const badge = BADGES.find((b) => b.id === newBadges[0]);
      if (badge) setPendingBadge(badge);
    }
  }, [earned]);

  const dismissBadge = useCallback(() => setPendingBadge(null), []);

  return { earned, pendingBadge, checkBadges, dismissBadge };
}
