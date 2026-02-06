import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FeedbackAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
}

export interface TesterFeedback {
  id: string;
  type: string;
  content: string;
  rating: number | null;
  status: 'open' | 'in_review' | 'closed';
  resolved_by_owner: boolean;
  created_at: string;
  attachments: FeedbackAttachment[];
}

export function useTesterFeedback(appId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tester-feedback', appId, user?.id],
    queryFn: async (): Promise<TesterFeedback[]> => {
      if (!appId || !user) return [];

      const { data: feedbackData, error } = await supabase
        .from('beta_feedback')
        .select(`
          id,
          type,
          content,
          rating,
          status,
          resolved_by_owner,
          created_at
        `)
        .eq('app_id', appId)
        .eq('tester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!feedbackData || feedbackData.length === 0) return [];

      // Fetch attachments for all feedback
      const feedbackIds = feedbackData.map(f => f.id);
      const { data: attachments, error: attachError } = await supabase
        .from('beta_feedback_attachments')
        .select('id, feedback_id, file_url, file_name, file_type')
        .in('feedback_id', feedbackIds);

      if (attachError) {
        console.error('Error fetching attachments:', attachError);
      }

      // Map attachments to feedback
      const attachmentsByFeedback: Record<string, FeedbackAttachment[]> = {};
      (attachments || []).forEach(att => {
        const feedbackId = (att as unknown as { feedback_id: string }).feedback_id;
        if (!attachmentsByFeedback[feedbackId]) {
          attachmentsByFeedback[feedbackId] = [];
        }
        attachmentsByFeedback[feedbackId].push({
          id: att.id,
          file_url: att.file_url,
          file_name: att.file_name,
          file_type: att.file_type,
        });
      });

      return feedbackData.map(f => ({
        id: f.id,
        type: f.type,
        content: f.content,
        rating: f.rating,
        status: (f.status || 'open') as 'open' | 'in_review' | 'closed',
        resolved_by_owner: f.resolved_by_owner || false,
        created_at: f.created_at,
        attachments: attachmentsByFeedback[f.id] || [],
      }));
    },
    enabled: !!appId && !!user,
  });

  const respondToResolution = useMutation({
    mutationFn: async ({ feedbackId, response }: { feedbackId: string; response: 'confirmed' | 'reopened' }) => {
      const newStatus = response === 'confirmed' ? 'closed' : 'open';
      
      const { error } = await supabase
        .from('beta_feedback')
        .update({
          status: newStatus,
          tester_response: response,
          tester_response_at: new Date().toISOString(),
        })
        .eq('id', feedbackId)
        .eq('tester_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tester-feedback', appId] });
    },
  });

  return {
    feedback: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    respondToResolution: respondToResolution.mutateAsync,
    responding: respondToResolution.isPending,
  };
}
