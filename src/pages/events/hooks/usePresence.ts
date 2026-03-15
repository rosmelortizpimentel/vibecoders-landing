import { useEffect, useRef, useCallback, useState } from 'react';
import { upsertPresence, removePresence, subscribePresence, fetchAllPresence } from '../supabaseEvents';
import { PRESENCE_THROTTLE_MS, REMOTE_PLAYER_TIMEOUT_S } from '../constants';
import type { AvatarConfig, FairPresence, RemotePlayer } from '../types';

export function usePresence(deviceId: string | null, name: string, avatar: AvatarConfig, currentStandId: string | null = null) {
  const [remotePlayers, setRemotePlayers] = useState<Map<string, RemotePlayer>>(new Map());
  const lastPublish = useRef(0);
  const [joinedName, setJoinedName] = useState<string | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    fetchAllPresence().then((all) => {
      const map = new Map<string, RemotePlayer>();
      all.forEach((p) => {
        if (p.device_id !== deviceId) {
          map.set(p.device_id, { ...p, targetX: p.pos_x, targetZ: p.pos_z, targetHeading: p.heading });
        }
      });
      setRemotePlayers(map);
    });

    const unsub = subscribePresence(
      (p: FairPresence) => {
        if (p.device_id === deviceId) return;
        setJoinedName(p.name);
        setRemotePlayers((prev) => {
          const next = new Map(prev);
          next.set(p.device_id, { ...p, targetX: p.pos_x, targetZ: p.pos_z, targetHeading: p.heading });
          return next;
        });
      },
      (p: FairPresence) => {
        if (p.device_id === deviceId) return;
        setRemotePlayers((prev) => {
          const next = new Map(prev);
          const existing = next.get(p.device_id);
          if (existing) {
            next.set(p.device_id, {
              ...existing,
              targetX: p.pos_x,
              targetZ: p.pos_z,
              targetHeading: p.heading,
              current_stand_id: p.current_stand_id,
              updated_at: p.updated_at,
              name: p.name,
              avatar: p.avatar,
            });
          } else {
            next.set(p.device_id, { ...p, targetX: p.pos_x, targetZ: p.pos_z, targetHeading: p.heading });
          }
          return next;
        });
      },
      (deletedId: string) => {
        setRemotePlayers((prev) => {
          const next = new Map(prev);
          next.delete(deletedId);
          return next;
        });
      },
    );

    return () => {
      unsub();
      removePresence(deviceId);
    };
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setRemotePlayers((prev) => {
        const next = new Map(prev);
        let changed = false;
        for (const [id, p] of next) {
          const age = (now - new Date(p.updated_at).getTime()) / 1000;
          if (age > REMOTE_PLAYER_TIMEOUT_S) {
            next.delete(id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const publishPosition = useCallback(
    (posX: number, posZ: number, heading: number) => {
      if (!deviceId) return;
      const now = Date.now();
      if (now - lastPublish.current < PRESENCE_THROTTLE_MS) return;
      lastPublish.current = now;
      upsertPresence({ device_id: deviceId, name, avatar, pos_x: posX, pos_z: posZ, heading, current_stand_id: currentStandId });
    },
    [deviceId, name, avatar, currentStandId],
  );

  return { remotePlayers, publishPosition, joinedName, clearJoined: () => setJoinedName(null) };
}
