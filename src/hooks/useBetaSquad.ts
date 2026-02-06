import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useBetaSquad(appId: string | undefined) {
  const { user } = useAuth();
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const joinBeta = useCallback(async () => {
    if (!appId || !user) return { success: false, error: 'Not authenticated' };

    try {
      setJoining(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(
        `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/join-beta`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ app_id: appId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to join' };
      }

      return { success: true, status: data.status };
    } catch (err) {
      console.error('Error joining beta:', err);
      return { success: false, error: 'Network error' };
    } finally {
      setJoining(false);
    }
  }, [appId, user]);

  const leaveBeta = useCallback(async () => {
    if (!appId || !user) return { success: false };

    try {
      setLeaving(true);

      const { error } = await supabase
        .from('beta_testers')
        .delete()
        .eq('app_id', appId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving beta:', error);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error('Error leaving beta:', err);
      return { success: false };
    } finally {
      setLeaving(false);
    }
  }, [appId, user]);

  const submitFeedback = useCallback(async (
    type: 'bug' | 'ux' | 'feature' | 'other',
    content: string,
    rating?: number
  ) => {
    if (!appId || !user) return { success: false, error: 'Not authenticated' };

    try {
      setSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(
        `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/submit-beta-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            app_id: appId,
            type,
            content,
            rating: rating || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to submit' };
      }

      return { success: true, feedback: data.feedback };
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return { success: false, error: 'Network error' };
    } finally {
      setSubmitting(false);
    }
  }, [appId, user]);

  const updateTesterStatus = useCallback(async (
    testerId: string,
    status: 'accepted' | 'rejected'
  ) => {
    if (!appId || !user) return { success: false };

    try {
      const { error } = await supabase
        .from('beta_testers')
        .update({ status })
        .eq('id', testerId)
        .eq('app_id', appId);

      if (error) {
        console.error('Error updating tester status:', error);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating tester status:', err);
      return { success: false };
    }
  }, [appId, user]);

  const removeTester = useCallback(async (testerId: string) => {
    if (!appId || !user) return { success: false };

    try {
      const { error } = await supabase
        .from('beta_testers')
        .delete()
        .eq('id', testerId)
        .eq('app_id', appId);

      if (error) {
        console.error('Error removing tester:', error);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error('Error removing tester:', err);
      return { success: false };
    }
  }, [appId, user]);

  const markFeedbackUseful = useCallback(async (feedbackId: string, isUseful: boolean) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('beta_feedback')
        .update({ is_useful: isUseful })
        .eq('id', feedbackId);

      if (error) {
        console.error('Error marking feedback:', error);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      console.error('Error marking feedback:', err);
      return { success: false };
    }
  }, [user]);

  return {
    joinBeta,
    leaveBeta,
    submitFeedback,
    updateTesterStatus,
    removeTester,
    markFeedbackUseful,
    joining,
    leaving,
    submitting,
  };
}