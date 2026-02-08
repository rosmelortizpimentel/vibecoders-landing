import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  tool_used: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

interface PromptFormData {
  title: string;
  description: string;
  tags: string[];
  tool_used: string;
  is_public: boolean;
}

const TOOL_OPTIONS = [
  'Lovable', 'Cursor', 'Windsurf', 'ChatGPT', 'Claude', 'Bolt', 'v0', 'Replit', 'Other'
] as const;

export { TOOL_OPTIONS };

export function usePrompts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation('prompts');

  // Public prompts for community
  const publicPromptsQuery = useQuery({
    queryKey: ['prompts', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts' as any)
        .select('*, profiles:user_id(name, username, avatar_url), prompt_files(*)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Prompt[];
    },
  });

  // User's own prompts
  const myPromptsQuery = useQuery({
    queryKey: ['prompts', 'mine', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('prompts' as any)
        .select('*, prompt_files(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Prompt[];
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
          tags: formData.tags,
          tool_used: formData.tool_used || null,
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
          tags: formData.tags,
          tool_used: formData.tool_used || null,
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

  // File upload
  const uploadFile = async (promptId: string, file: File): Promise<PromptFile> => {
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
    uploadFile,
    deleteFile,
  };
}
