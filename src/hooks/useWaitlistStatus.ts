import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useWaitlistStatus() {
  const { user } = useAuth();
  const [isInWaitlist, setIsInWaitlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkWaitlistStatus() {
      if (!user?.email) {
        setIsInWaitlist(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('waitlist')
          .select('id')
          .eq('email', user.email)
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
  }, [user?.email]);

  return { isInWaitlist, loading };
}
