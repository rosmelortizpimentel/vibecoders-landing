import { useState, useCallback } from 'react';
import { LOCALSTORAGE_KEYS } from '../constants';
import type { AvatarConfig } from '../types';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(
    () => localStorage.getItem(LOCALSTORAGE_KEYS.deviceId)
  );
  const [savedName, setSavedName] = useState<string | null>(
    () => localStorage.getItem(LOCALSTORAGE_KEYS.visitorName)
  );
  const [savedAvatar, setSavedAvatar] = useState<AvatarConfig | null>(() => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEYS.avatar);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const createDevice = useCallback((name: string, avatar: AvatarConfig) => {
    const id = crypto.randomUUID();
    localStorage.setItem(LOCALSTORAGE_KEYS.deviceId, id);
    localStorage.setItem(LOCALSTORAGE_KEYS.visitorName, name);
    localStorage.setItem(LOCALSTORAGE_KEYS.avatar, JSON.stringify(avatar));
    setDeviceId(id);
    setSavedName(name);
    setSavedAvatar(avatar);
    return id;
  }, []);

  const hasExisting = Boolean(deviceId && savedName);

  return { deviceId, savedName, savedAvatar, createDevice, hasExisting };
}
