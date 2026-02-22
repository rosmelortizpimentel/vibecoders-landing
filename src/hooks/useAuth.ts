import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { queryClient } from '@/lib/react-query';
import { FounderStatusResponse } from './useFounderStatus';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Use a module-level variable to deduplicate activity logging across hook instances
  const logActivity = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const logKey = `last_activity_log_${userId}_${today}`;
    
    // Check session storage to avoid repeating in the same session/tab
    if (sessionStorage.getItem(logKey)) return;
    
    // Mark as logged immediately to avoid concurrent racy calls
    sessionStorage.setItem(logKey, 'true');
    
    try {
      await supabase
        .from('user_activity_log')
        .upsert(
          { user_id: userId, active_date: today },
          { onConflict: 'user_id,active_date' }
        );
    } catch (err) {
      console.error('Error logging daily activity:', err);
      // Remove item so it can retry if it failed (optional)
      sessionStorage.removeItem(logKey);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Handle return URL after successful sign in
        if (event === 'SIGNED_IN' && currentSession?.user) {
          const returnUrl = localStorage.getItem('authReturnUrl');
          const signupSource = localStorage.getItem('signupSource');
          localStorage.removeItem('signupSource');
          
          if (returnUrl) {
            localStorage.removeItem('authReturnUrl');
            setTimeout(() => {
              window.location.href = returnUrl;
            }, 0);
          } else {
            // If paid_card, set a flag BEFORE the async call so DashboardLayout knows not to redirect
            if (signupSource === 'paid_card') {
              localStorage.setItem('pendingStripeRedirect', 'true');
            }
            
            // Check founder status and redirect
            const body: Record<string, string> = {};
            if (signupSource) body.signupSource = signupSource;
            
            queryClient.fetchQuery({
              queryKey: ['founder-status', currentSession.user.id],
              queryFn: async () => {
                const { data, error } = await supabase.functions.invoke('check-founder-status', { body });
                if (error) throw error;
                return data as FounderStatusResponse;
              },
              staleTime: 0,
            }).then(async (data) => {
              if (signupSource === 'paid_card') {
                // Only redirect to Stripe if user doesn't already have a paid subscription
                const userTier = data?.tier;
                if (userTier === 'pro' || userTier === 'founder') {
                  // Already paid -- go to dashboard
                  localStorage.removeItem('pendingStripeRedirect');
                  window.location.href = '/me/profile';
                  return;
                }
                
                try {
                  const { data: checkoutData } = await supabase.functions.invoke('create-checkout-session');
                  if (checkoutData?.url) {
                    localStorage.removeItem('pendingStripeRedirect');
                    window.location.href = checkoutData.url;
                    return;
                  }
                } catch (e) {
                  console.error('Checkout error:', e);
                }
                localStorage.removeItem('pendingStripeRedirect');
                window.location.href = '/choose-plan';
              } else if (window.location.pathname === '/') {
                window.location.href = '/me/profile';
              }
            }).catch((err) => {
              console.error(err);
              localStorage.removeItem('pendingStripeRedirect');
            });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);

      // Silent daily activity log (deduplicated)
      if (existingSession?.user) {
        logActivity(existingSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/me`,
      },
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithLinkedIn = async (redirectTo?: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/me`,
      },
    });
    
    if (error) {
      console.error('Error signing in with LinkedIn:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithIdToken = async (idToken: string) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Error signing in with ID token:', error);
      throw error;
    }

    return data;
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithIdToken,
    signOut,
  };
}
