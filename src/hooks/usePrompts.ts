import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export type ResourceType = 'chat_prompt' | 'system_rule' | 'file_template';
export type IntentCategory = 'ui_gen' | 'backend_logic' | 'app_config' | 'branding_assets' | 'database' | 'testing';

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  result_url: string | null;
  tags: string[];
  tool_used: string | null;
  tool_compatibility: string[];
  resource_type: ResourceType;
  intent_category: IntentCategory;
  filename: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  likes_count?: number; // Virtual field
  is_liked?: boolean; // Virtual field
  profiles?: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  prompt_files?: PromptFile[];
}

export interface PromptFile {
  id: string;
  prompt_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_role: 'attachment' | 'result_image';
  created_at: string;
}

interface PromptFormData {
  title: string;
  description: string;
  result_url?: string;
  tags: string[];
  tool_used?: string;
  tool_compatibility: string[];
  resource_type: ResourceType;
  intent_category: IntentCategory;
  filename?: string;
  is_public: boolean;
}

const COMPATIBILITY_OPTIONS = [
  'Lovable', 'Cursor', 'Windsurf', 'ChatGPT', 'Claude', 'Bolt', 'v0', 'Replit', 'Other'
] as const;

const INTENT_OPTIONS = [
  { value: 'ui_gen', label: 'UI Generation' },
  { value: 'backend_logic', label: 'Backend Logic' },
  { value: 'app_config', label: 'App Configuration' },
  { value: 'branding_assets', label: 'Branding & Assets' },
  { value: 'database', label: 'Database' },
  { value: 'testing', label: 'Testing' },
] as const;

export { COMPATIBILITY_OPTIONS, INTENT_OPTIONS };

export function usePrompts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation('prompts');

  // Helper to process prompts with likes
  const processPrompts = async (prompts: any[]) => {
    if (!prompts.length) return [];
    
    // Get likes counts
    const promptsWithCounts = await Promise.all(prompts.map(async (p) => {
      const { count } = await supabase
        .from('resource_likes')
        .select('*', { count: 'exact', head: true })
        .eq('resource_id', p.id);
      return { ...p, likes_count: count || 0 };
    }));

    // If user is logged in, check which they liked
    if (user) {
      const { data: userLikes } = await supabase
        .from('resource_likes')
        .select('resource_id')
        .eq('user_id', user.id);
        
      const likedIds = new Set(userLikes?.map(l => l.resource_id) || []);
      return promptsWithCounts.map(p => ({
        ...p,
        is_liked: likedIds.has(p.id)
      }));
    }

    return promptsWithCounts.map(p => ({ ...p, is_liked: false }));
  };

  // Public prompts for community
  const publicPromptsQuery = useQuery({
    queryKey: ['prompts', 'public', user?.id], // Add user.id to refetch on auth change
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts' as any)
        .select('*, profiles:user_id(name, username, avatar_url), prompt_files(*)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return processPrompts(data || []);
    },
  });

  // User's own prompts
  const myPromptsQuery = useQuery({
    queryKey: ['prompts', 'mine', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('prompts' as any)
        .select('*, profiles:user_id(name, username, avatar_url), prompt_files(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return processPrompts(data || []);
    },
    enabled: !!user,
  });

  const createPrompt = useMutation({
    mutationFn: async (formData: PromptFormData) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('prompts' as any)
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          result_url: formData.result_url || null,
          tags: formData.tags,
          tool_used: formData.tool_used || null, // Optional now
          tool_compatibility: formData.tool_compatibility,
          resource_type: formData.resource_type,
          intent_category: formData.intent_category,
          filename: formData.filename || null,
          is_public: formData.is_public,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as Prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success(t('saved'));
    },
  });

  const updatePrompt = useMutation({
    mutationFn: async ({ id, ...formData }: PromptFormData & { id: string }) => {
      const { error } = await supabase
        .from('prompts' as any)
        .update({
          title: formData.title,
          description: formData.description || null,
          result_url: formData.result_url || null,
          tags: formData.tags,
          tool_used: formData.tool_used || null,
          tool_compatibility: formData.tool_compatibility,
          resource_type: formData.resource_type,
          intent_category: formData.intent_category,
          filename: formData.filename || null,
          is_public: formData.is_public,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success(t('saved'));
    },
  });

  const deletePrompt = useMutation({
    mutationFn: async (id: string) => {
      // Delete storage files first
      const { data: files } = await supabase
        .from('prompt_files' as any)
        .select('file_url')
        .eq('prompt_id', id);

      if (files && files.length > 0) {
        const paths = (files as any[]).map((f: any) => {
          const url = f.file_url as string;
          const match = url.match(/prompt-attachments\/(.+)$/);
          return match ? match[1] : null;
        }).filter(Boolean) as string[];
        if (paths.length > 0) {
          await supabase.storage.from('prompt-attachments').remove(paths);
        }
      }

      const { error } = await supabase.from('prompts' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success(t('deleted'));
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_public }: { id: string; is_public: boolean }) => {
      const { error } = await supabase
        .from('prompts' as any)
        .update({ is_public })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      toast.success(variables.is_public ? t('visibility.madePublic') : t('visibility.madePrivate'));
    },
  });

  const toggleLike = useMutation({
    mutationFn: async ({ resourceId, isLiked }: { resourceId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('resource_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('resource_likes')
          .insert({ user_id: user.id, resource_id: resourceId });
        if (error) throw error;
      }
    },
    onMutate: async ({ resourceId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['prompts'] });
      const previousPrompts = queryClient.getQueryData(['prompts']);

      queryClient.setQueriesData({ queryKey: ['prompts'] }, (old: any) => {
        if (!old) return old;
        return old.map((p: Prompt) => {
          if (p.id === resourceId) {
            return {
              ...p,
              is_liked: !isLiked,
              likes_count: (p.likes_count || 0) + (isLiked ? -1 : 1),
            };
          }
          return p;
        });
      });

      return { previousPrompts };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueriesData({ queryKey: ['prompts'] }, context?.previousPrompts);
      toast.error(t('error'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  // File upload
  const uploadFile = async (promptId: string, file: File, fileRole: 'attachment' | 'result_image' = 'attachment'): Promise<PromptFile> => {
    if (!user) throw new Error('Not authenticated');
    const filePath = `${user.id}/${promptId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('prompt-attachments')
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('prompt-attachments')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('prompt_files' as any)
      .insert({
        prompt_id: promptId,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_role: fileRole,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as PromptFile;
  };

  const deleteFile = async (fileId: string, fileUrl: string) => {
    const match = fileUrl.match(/prompt-attachments\/(.+)$/);
    if (match) {
      await supabase.storage.from('prompt-attachments').remove([match[1]]);
    }
    const { error } = await supabase.from('prompt_files' as any).delete().eq('id', fileId);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['prompts'] });
  };

  return {
    publicPrompts: publicPromptsQuery.data || [],
    myPrompts: myPromptsQuery.data || [],
    isLoadingPublic: publicPromptsQuery.isLoading,
    isLoadingMine: myPromptsQuery.isLoading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleVisibility,
    toggleLike,
    uploadFile,
    deleteFile,
  };
}

export function usePrompt(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['prompts', id, user?.id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('prompts' as any)
        .select('*, profiles:user_id(name, username, avatar_url), prompt_files(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Fetch likes for single prompt
      const { count } = await supabase
        .from('resource_likes')
        .select('*', { count: 'exact', head: true })
        .eq('resource_id', id);
        
      let is_liked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from('resource_likes')
          .select('user_id')
          .eq('resource_id', id)
          .eq('user_id', user.id)
          .single();
        is_liked = !!likeData;
      }
      
      return { ...(data as object), likes_count: count || 0, is_liked } as unknown as Prompt;
    },
    enabled: !!id,
  });
}
