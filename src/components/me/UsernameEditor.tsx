import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UsernameEditorProps {
  currentUsername: string | null;
  onUpdate: (username: string) => void;
  userId: string;
}

export function UsernameEditor({ currentUsername, onUpdate, userId }: UsernameEditorProps) {
  const [username, setUsername] = useState(currentUsername || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkUsernameAvailable = useCallback(async (usernameToCheck: string): Promise<boolean> => {
    if (!userId || !usernameToCheck) return false;

    try {
      const { data, error } = await supabase.functions.invoke('check-username-available', {
        body: { username: usernameToCheck.toLowerCase() }
      });

      if (error) {
        console.error('Error checking username availability:', error);
        return false;
      }

      return data?.success && data?.available;
    } catch (err) {
      console.error('Error invoking check-username-available:', err);
      return false;
    }
  }, [userId]);

  // Sync with prop changes
  useEffect(() => {
    setUsername(currentUsername || '');
    setIsAvailable(currentUsername ? true : null);
  }, [currentUsername]);

  // Debounce de 1 segundo para validar disponibilidad
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    const normalizedUsername = username.toLowerCase();
    const normalizedCurrentUsername = currentUsername?.toLowerCase();

    if (normalizedUsername === normalizedCurrentUsername) {
      setIsAvailable(true);
      setError(null);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      if (!active) return;
      
      setIsChecking(true);
      const available = await checkUsernameAvailable(username);
      
      if (!active) return;
      
      setIsAvailable(available);
      setIsChecking(false);
      
      if (!available) {
        setError('Username no disponible');
      } else {
        setError(null);
        // Auto-save when available
        onUpdate(username.toLowerCase());
      }
    }, 1000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username, currentUsername, checkUsernameAvailable, onUpdate]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (value.length <= 20) {
      setUsername(value);
      setError(null);
      setIsAvailable(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="username" className="text-[#1c1c1c]">Username</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
          @
        </span>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="tu_username"
          className="pl-7 pr-10 border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isChecking && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {!isChecking && isAvailable === true && (
            <Check className="h-4 w-4 text-[#3D5AFE]" />
          )}
          {!isChecking && isAvailable === false && (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Hasta 20 caracteres (letras, números o _)
      </p>
    </div>
  );
}
