import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserTier = 'founder' | 'free' | 'pro' | 'pending';

interface Subscription {
  tier: UserTier;
  founder_number: number | null;
  founder_welcome_seen: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('tier, founder_number, founder_welcome_seen')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      if (!data) return null;

      const subData = data as any; // Still need to cast because select string doesn't provide precise row type in current version
      return {
        tier: subData.tier as UserTier,
        founder_number: subData.founder_number,
        founder_welcome_seen: subData.founder_welcome_seen ?? false,
      };
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const checkFounderStatus = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-founder-status');
      if (error) throw error;
      return data as { tier: UserTier; founderNumber: number | null; needsPlanSelection: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['founder-status'] });
    },
  });

  const setFreeTier = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.functions.invoke('set-free-tier');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const createCheckout = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      if (error) throw error;
      return data as { url: string };
    },
  });

  const tier = subscription?.tier as UserTier | undefined;

  return {
    subscription,
    tier: tier || null,
    founderNumber: subscription?.founder_number || null,
    founderWelcomeSeen: subscription?.founder_welcome_seen ?? true,
    isFounder: tier === 'founder',
    isPro: tier === 'pro',
    isFree: tier === 'free',
    isPending: tier === 'pending',
    loading: isLoading,
    checkFounderStatus,
    setFreeTier,
    createCheckout,
  };
}
