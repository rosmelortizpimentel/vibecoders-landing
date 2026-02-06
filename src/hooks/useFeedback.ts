import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';

export interface FeedbackThread {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  message_count?: number;
}

export interface FeedbackMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_admin_reply: boolean;
  created_at: string;
  read_at: string | null;
  attachments?: FeedbackAttachment[];
  sender?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface FeedbackAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export function useFeedback() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();

  console.log('[useFeedback] isAdmin:', isAdmin, 'roleLoading:', roleLoading, 'userId:', user?.id);
  // Get or create user's thread
  const { data: userThread, isLoading: threadLoading } = useQuery({
    queryKey: ['feedbackThread', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('feedback_threads')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as FeedbackThread | null;
    },
    enabled: !!user?.id,
  });

  // Get messages for a thread
  const useThreadMessages = (threadId: string | null) => {
    return useQuery({
      queryKey: ['feedbackMessages', threadId],
      queryFn: async () => {
        if (!threadId) return [];
        
        const { data: messages, error: messagesError } = await supabase
          .from('feedback_messages')
          .select('*')
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;

        // Get attachments for all messages
        const messageIds = messages.map(m => m.id);
        const { data: attachments, error: attachmentsError } = await supabase
          .from('feedback_attachments')
          .select('*')
          .in('message_id', messageIds);
        
        if (attachmentsError) throw attachmentsError;

        // Get sender profiles
        const senderIds = [...new Set(messages.map(m => m.sender_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', senderIds);
        
        if (profilesError) throw profilesError;

        // Map attachments and senders to messages
        return messages.map(msg => ({
          ...msg,
          attachments: attachments?.filter(a => a.message_id === msg.id) || [],
          sender: profiles?.find(p => p.id === msg.sender_id),
        })) as FeedbackMessage[];
      },
      enabled: !!threadId,
    });
  };

  // Get all threads for admin
  const { data: allThreads, isLoading: threadsLoading } = useQuery({
    queryKey: ['feedbackThreads'],
    queryFn: async () => {
      const { data: threads, error: threadsError } = await supabase
        .from('feedback_threads')
        .select('*')
        .order('last_message_at', { ascending: false });
      
      if (threadsError) throw threadsError;

      // Get profiles for all threads
      const userIds = threads.map(t => t.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;

      // Get message counts for each thread
      const { data: counts, error: countsError } = await supabase
        .from('feedback_messages')
        .select('thread_id')
        .in('thread_id', threads.map(t => t.id));
      
      if (countsError) throw countsError;

      // Map profiles and counts to threads
      return threads.map(thread => ({
        ...thread,
        profile: profiles?.find(p => p.id === thread.user_id),
        message_count: counts?.filter(c => c.thread_id === thread.id).length || 0,
      })) as FeedbackThread[];
    },
    enabled: isAdmin,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      content, 
      threadId, 
      attachmentUrls 
    }: { 
      content: string; 
      threadId?: string | null; 
      attachmentUrls?: { url: string; name: string; type: string }[] 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      let finalThreadId = threadId || null;

      console.log('[useFeedback] sendMessage - threadId:', threadId, 'isAdmin:', isAdmin, 'userId:', user.id);

      // Create thread if it doesn't exist
      // Anyone can start a new conversation from /hablemos
      if (!finalThreadId) {
        console.log('[useFeedback] Creating new feedback thread for user:', user.id);
        const { data: newThread, error: threadError } = await supabase
          .from('feedback_threads')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (threadError) {
          console.error('[useFeedback] Error creating thread:', threadError);
          throw threadError;
        }
        console.log('[useFeedback] Created new thread:', newThread.id);
        finalThreadId = newThread.id;
      }

      if (!finalThreadId) {
        console.error('[useFeedback] No thread ID available after creation attempt');
        throw new Error('No thread ID');
      }

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('feedback_messages')
        .insert({
          thread_id: finalThreadId,
          sender_id: user.id,
          content,
          is_admin_reply: isAdmin,
        })
        .select()
        .single();
      
      if (messageError) throw messageError;

      // Insert attachments if any
      if (attachmentUrls && attachmentUrls.length > 0) {
        const attachments = attachmentUrls.map(att => ({
          message_id: message.id,
          file_url: att.url,
          file_name: att.name,
          file_type: att.type,
        }));

        const { error: attachError } = await supabase
          .from('feedback_attachments')
          .insert(attachments);
        
        if (attachError) throw attachError;
      }

      return { message, threadId: finalThreadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feedbackMessages', data.threadId] });
      queryClient.invalidateQueries({ queryKey: ['feedbackThread'] });
      queryClient.invalidateQueries({ queryKey: ['feedbackThreads'] });
    },
  });

  // Upload files to storage
  const uploadFiles = async (files: File[]): Promise<{ url: string; name: string; type: string }[]> => {
    if (!user?.id) throw new Error('Not authenticated');

    const uploads = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/${fileName}`;

        const { error } = await supabase.storage
          .from('feedback-attachments')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('feedback-attachments')
          .getPublicUrl(filePath);

        return {
          url: urlData.publicUrl,
          name: file.name,
          type: file.type,
        };
      })
    );

    return uploads;
  };

  return {
    userThread,
    threadLoading,
    allThreads,
    threadsLoading,
    useThreadMessages,
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    uploadFiles,
  };
}
