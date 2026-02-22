import { useQuery } from '@tanstack/react-query';
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

  const { data: isInWaitlist = false, isLoading } = useQuery({
    queryKey: ['waitlist', user?.email],
    queryFn: async () => {
      if (!user?.email) return false;
      
      const normalizedEmail = normalizeEmail(user.email);
      const { data, error } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error('Error checking waitlist status:', error);
        return false;
      }
      return !!data;
    },
    enabled: !authLoading && !!user?.email,
    staleTime: 5 * 60 * 1000, // Waitlist status is quite static
  });

  return { isInWaitlist, loading: authLoading || isLoading };
}
