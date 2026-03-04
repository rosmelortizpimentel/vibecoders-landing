import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface RoadmapSettings {
  id: string;
  app_id: string;
  custom_title: string | null;
  font_family: string;
  favicon_url: string | null;
  is_public: boolean;
  is_feedback_public: boolean;
  feedback_auth_mode: 'anonymous' | 'authenticated';
  default_language: string | null;
  custom_domain: string | null;
  primary_color: string | null;
  primary_button_color: string | null;
  primary_button_text_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapLane {
  id: string;
  app_id: string;
  name: string;
  color: string;
  font: string;
  display_order: number;
  created_at: string;
}

export interface RoadmapCard {
  id: string;
  app_id: string;
  lane_id: string;
  title: string;
  description: string | null;
  display_order: number;
  completed_at: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapFeedback {
  id: string;
  app_id: string;
  linked_card_id: string | null;
  title: string;
  description: string;
  author_id: string | null;
  author_name: string | null;
  author_email: string | null;
  author_username?: string | null;
  author_avatar_url?: string | null;
  status: string;
  owner_response: string | null;
  owner_response_at: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  attachments?: RoadmapFeedbackAttachment[];
  user_liked?: boolean;
}

export interface RoadmapFeedbackAttachment {
  id: string;
  feedback_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string | null;
}

const DEFAULT_LANES = [
  { name: 'Backlog', color: '#6B7280', display_order: 0 },
  { name: 'Planned', color: '#F59E0B', display_order: 1 },
  { name: 'In Progress', color: '#3B82F6', display_order: 2 },
  { name: 'Done', color: '#10B981', display_order: 3 },
];

export function useRoadmap(appId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: roadmapData, isLoading: loading, error } = useQuery({
    queryKey: ['roadmap', appId],
    queryFn: async () => {
      if (!appId) return null;
      
      const [settingsRes, lanesRes, cardsRes] = await Promise.all([
        supabase.from('roadmap_settings').select('*').eq('app_id', appId).maybeSingle(),
        supabase.from('roadmap_lanes').select('*').eq('app_id', appId).order('display_order'),
        supabase.from('roadmap_cards').select('*').eq('app_id', appId).order('display_order'),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (lanesRes.error) throw lanesRes.error;
      if (cardsRes.error) throw cardsRes.error;

      return {
        settings: settingsRes.data as RoadmapSettings | null,
        lanes: (lanesRes.data || []) as RoadmapLane[],
        cards: (cardsRes.data || []) as RoadmapCard[],
      };
    },
    enabled: !!appId,
    staleTime: 0,
  });

  const settings = roadmapData?.settings ?? null;
  const lanes = useMemo(() => roadmapData?.lanes ?? [], [roadmapData?.lanes]);
  const cards = useMemo(() => roadmapData?.cards ?? [], [roadmapData?.cards]);

  // Initialize roadmap with default lanes
  const initializeRoadmap = useCallback(async () => {
    if (!appId || !user) return;

    const { data: settingsData, error: settingsErr } = await supabase
      .from('roadmap_settings')
      .insert({ app_id: appId, is_public: false })
      .select()
      .single();

    if (settingsErr) throw settingsErr;

    const lanesInsert = DEFAULT_LANES.map(l => ({ ...l, app_id: appId, font: '' }));
    const { error: lanesErr } = await supabase
      .from('roadmap_lanes')
      .insert(lanesInsert);

    if (lanesErr) throw lanesErr;

    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
    return settingsData;
  }, [appId, user, queryClient]);

  // Settings
  const updateSettings = useCallback(async (updates: Partial<RoadmapSettings>) => {
    if (!settings) return;
    const { error } = await supabase
      .from('roadmap_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [settings, appId, queryClient]);

  // Lanes
  const createLane = useCallback(async (name: string, color = '#3D5AFE') => {
    if (!appId) return;
    const maxOrder = lanes.length > 0 ? Math.max(...lanes.map(l => l.display_order)) : -1;
    const { data, error } = await supabase
      .from('roadmap_lanes')
      .insert({ app_id: appId, name, color, display_order: maxOrder + 1 })
      .select()
      .single();
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
    return data;
  }, [appId, lanes, queryClient]);

  const updateLane = useCallback(async (laneId: string, updates: Partial<RoadmapLane>) => {
    const { error } = await supabase
      .from('roadmap_lanes')
      .update(updates)
      .eq('id', laneId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  const deleteLane = useCallback(async (laneId: string) => {
    const { error } = await supabase
      .from('roadmap_lanes')
      .delete()
      .eq('id', laneId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  const reorderLanes = useCallback(async (reordered: RoadmapLane[]) => {
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('roadmap_lanes').update({ display_order: i }).eq('id', reordered[i].id);
    }
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  // Cards
  const createCard = useCallback(async (laneId: string, title: string, description?: string) => {
    if (!appId) return;
    const laneCards = cards.filter(c => c.lane_id === laneId);
    const maxOrder = laneCards.length > 0 ? Math.max(...laneCards.map(c => c.display_order)) : -1;
    const { data, error } = await supabase
      .from('roadmap_cards')
      .insert({ app_id: appId, lane_id: laneId, title, description, display_order: maxOrder + 1 })
      .select()
      .single();
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
    return data;
  }, [appId, cards, queryClient]);

  const updateCard = useCallback(async (cardId: string, updates: Partial<RoadmapCard>) => {
    const { error } = await supabase
      .from('roadmap_cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cardId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  const deleteCard = useCallback(async (cardId: string) => {
    const { error } = await supabase
      .from('roadmap_cards')
      .delete()
      .eq('id', cardId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  const moveCard = useCallback(async (cardId: string, newLaneId: string, newOrder: number, completedAt?: string | null) => {
    const updateData: { 
      lane_id: string; 
      display_order: number; 
      updated_at: string; 
      completed_at?: string | null;
    } = { lane_id: newLaneId, display_order: newOrder, updated_at: new Date().toISOString() };
    if (completedAt !== undefined) updateData.completed_at = completedAt;
    const { error } = await supabase
      .from('roadmap_cards')
      .update(updateData)
      .eq('id', cardId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  const reorderCards = useCallback(async (laneId: string, reorderedCards: RoadmapCard[]) => {
    for (let i = 0; i < reorderedCards.length; i++) {
      await supabase
        .from('roadmap_cards')
        .update({ display_order: i, updated_at: new Date().toISOString() })
        .eq('id', reorderedCards[i].id);
    }
    await queryClient.invalidateQueries({ queryKey: ['roadmap', appId] });
  }, [appId, queryClient]);

  return {
    settings, lanes, cards, loading, error,
    initializeRoadmap, updateSettings,
    createLane, updateLane, deleteLane, reorderLanes,
    createCard, updateCard, deleteCard, moveCard, reorderCards,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['roadmap', appId] }),
  };
}

// Separate hook for public feedback
export function useRoadmapFeedback(appId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: feedback = [], isLoading: loading, error } = useQuery({
    queryKey: ['roadmap-feedback', appId],
    queryFn: async () => {
      if (!appId) return [];
      const { data, error } = await supabase
        .from('roadmap_feedback')
        .select('*, roadmap_feedback_attachments(*)')
        .eq('app_id', appId)
        .order('likes_count', { ascending: false });

      if (error) throw error;
      return (data || []).map(f => ({
        ...f,
        author_id: (f as any).author_id || null,
        attachments: f.roadmap_feedback_attachments || [],
      })) as RoadmapFeedback[];
    },
    enabled: !!appId,
    staleTime: 0,
  });

  const submitFeedback = useCallback(async (data: {
    title: string;
    description: string;
    author_name?: string;
    author_email?: string;
    attachments?: { file_url: string; file_name: string; file_type: string; file_size: number; file_path?: string }[];
  }) => {
    if (!appId) return;
    const { data: fb, error } = await supabase
      .from('roadmap_feedback')
      .insert({ 
        app_id: appId, 
        title: data.title, 
        description: data.description, 
        author_name: data.author_name, 
        author_email: data.author_email,
        author_id: user?.id || null
      })
      .select()
      .single();
    if (error) throw error;

    if (data.attachments && data.attachments.length > 0) {
      await supabase
        .from('roadmap_feedback_attachments')
        .insert(data.attachments.map(a => ({ feedback_id: fb.id, ...a })));
    }

    await queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] });
    return fb;
  }, [appId, queryClient]);

  const toggleLike = useCallback(async (feedbackId: string, fingerprint: string) => {
    const { data: existing } = await supabase
      .from('roadmap_feedback_likes')
      .select('id')
      .eq('feedback_id', feedbackId)
      .eq('device_fingerprint', fingerprint)
      .maybeSingle();

    if (existing) {
      await supabase.from('roadmap_feedback_likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('roadmap_feedback_likes').insert({ feedback_id: feedbackId, device_fingerprint: fingerprint });
    }

    await queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] });
  }, [appId, queryClient]);

  const respondToFeedback = useCallback(async (feedbackId: string, response: string) => {
    const { error } = await supabase
      .from('roadmap_feedback')
      .update({ owner_response: response, owner_response_at: new Date().toISOString(), status: 'reviewed' })
      .eq('id', feedbackId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] });
  }, [appId, queryClient]);

  const updateFeedbackStatus = useCallback(async (feedbackId: string, status: string) => {
    const { error } = await supabase
      .from('roadmap_feedback')
      .update({ status })
      .eq('id', feedbackId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] });
  }, [appId, queryClient]);

  const linkToCard = useCallback(async (feedbackId: string, cardId: string | null) => {
    const { error } = await supabase
      .from('roadmap_feedback')
      .update({ linked_card_id: cardId })
      .eq('id', feedbackId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] });
  }, [appId, queryClient]);

  const deleteFeedback = useCallback(async (feedbackId: string) => {
    const { error } = await supabase
      .from('roadmap_feedback')
      .delete()
      .eq('id', feedbackId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] });
  }, [appId, queryClient]);

  return {
    feedback, loading, error,
    submitFeedback, toggleLike, respondToFeedback,
    updateFeedbackStatus, linkToCard, deleteFeedback,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['roadmap-feedback', appId] }),
  };
}
