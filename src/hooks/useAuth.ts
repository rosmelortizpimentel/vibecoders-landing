import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
          if (returnUrl) {
            localStorage.removeItem('authReturnUrl');
            setTimeout(() => {
              window.location.href = returnUrl;
            }, 0);
          } else {
            // Check founder status and redirect
            supabase.functions.invoke('check-founder-status').then(({ data }) => {
              if (data?.accessClosed) {
                window.location.href = '/closed';
              } else if (window.location.pathname === '/') {
                window.location.href = '/me/profile';
              }
            }).catch(console.error);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);

      // Silent daily activity log (transparent, no impact on UX)
      if (existingSession?.user) {
        supabase
          .from('user_activity_log')
          .upsert(
            { user_id: existingSession.user.id, active_date: new Date().toISOString().split('T')[0] },
            { onConflict: 'user_id,active_date' }
          )
          .then(() => {});
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
