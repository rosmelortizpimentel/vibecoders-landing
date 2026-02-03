import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Normaliza un email removiendo aliases (+algo)
 * cesaras+test@gmail.com → cesaras@gmail.com
 */
function normalizeEmail(email: string): string {
  const [localPart, domain] = email.toLowerCase().trim().split('@');
  if (!domain) return email.toLowerCase().trim();
  
  const normalizedLocal = localPart.split('+')[0];
  return `${normalizedLocal}@${domain}`;
}

export function useWaitlistStatus() {
  const { user, loading: authLoading } = useAuth();
  const [isInWaitlist, setIsInWaitlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkWaitlistStatus() {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!user?.email) {
        setIsInWaitlist(false);
        setLoading(false);
        return;
      }

      try {
        const normalizedEmail = normalizeEmail(user.email);
        const { data, error } = await supabase
          .from('waitlist')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (error) {
          console.error('Error checking waitlist status:', error);
          setIsInWaitlist(false);
        } else {
          setIsInWaitlist(!!data);
        }
      } catch (err) {
        console.error('Error checking waitlist:', err);
        setIsInWaitlist(false);
      } finally {
        setLoading(false);
      }
    }

    checkWaitlistStatus();
  }, [user?.email, authLoading]);

  return { isInWaitlist, loading };
}
