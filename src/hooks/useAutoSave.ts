import { useCallback, useRef, useState, useEffect } from 'react';

type SaveFunction<T> = (data: T) => Promise<void>;

interface UseAutoSaveOptions {
  debounceMs?: number;
}

interface UseAutoSaveReturn<T> {
  save: (data: T) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

export function useAutoSave<T>(
  saveFn: SaveFunction<T>,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn<T> {
  const { debounceMs = 800 } = options;
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeSave = useCallback(async (data: T) => {
    if (!isMountedRef.current) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await saveFn(data);
      if (isMountedRef.current) {
        setLastSaved(new Date());
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Error al guardar'));
        console.error('Auto-save error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [saveFn]);

  const save = useCallback((data: Partial<T> | T) => {
    // Merge new updates into pending data to avoid losing fields
    pendingDataRef.current = (typeof data === 'object' && data !== null && !Array.isArray(data)) 
      ? { ...pendingDataRef.current, ...data } as T
      : data as T;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current !== null) {
        executeSave(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs, executeSave]);

  return { save, isSaving, lastSaved, error };
}
