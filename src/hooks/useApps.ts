import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface AppData {
  id: string;
  user_id: string;
  url: string;
  name: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  category_id: string | null;
  status_id: string | null;
  hours_ideation: number | null;
  hours_building: number | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  stacks?: string[];
  is_verified: boolean;
  verification_token: string;
  verified_at: string | null;
  verified_url: string | null;
  screenshots: string[];
  open_to_partnerships: boolean;
  partnership_types: string[];
  // Beta fields
  beta_active: boolean;
  beta_mode: string;
  beta_limit: number;
  beta_link: string | null;
  beta_instructions: string | null;
  tags: string[];
  analytics_enabled: boolean;
}

export function useApps() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['user-private-apps', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get apps where user is owner
      const { data: ownedApps, error: ownedError } = await supabase
        .from('apps')
        .select(`
          *,
          app_stacks(stack_id)
        `)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (ownedError) throw ownedError;

      // Get apps where user is co-founder
      const { data: foundedApps, error: founderError } = await supabase
        .from('app_founders')
        .select(`
          app_id,
          app:apps(
            *,
            app_stacks(stack_id)
          )
        `)
        .eq('user_id', user.id);

      if (founderError) throw founderError;

      const coFoundedApps = (foundedApps || [])
        .map(f => f.app)
        .filter((app): app is NonNullable<typeof app> => app !== null)
        .map(app => app as unknown as typeof ownedApps[number]);
      
      // Combine and filter duplicates
      const allApps = [...(ownedApps || []), ...coFoundedApps];
      const uniqueApps = allApps.filter((app, index, self) =>
        index === self.findIndex((t) => t.id === app.id)
      );

      return uniqueApps.map(app => ({
        ...app,
        stacks: app.app_stacks?.map((s: { stack_id: string }) => s.stack_id) || [],
        screenshots: app.screenshots || [],
        open_to_partnerships: app.open_to_partnerships || false,
        partnership_types: app.partnership_types || [],
        tags: (app as { tags?: string[] }).tags || [],
      })) || [];
    },
    enabled: !!user,
    staleTime: 0, // Deduplicate concurrent requests but don't cache persistently
  });

  const createApp = useCallback(async (url: string) => {
    if (!user) throw new Error('No user');

    const maxOrder = apps.length > 0 ? Math.max(...apps.map(a => a.display_order)) : 0;

    const { data, error } = await supabase
      .from('apps')
      .insert({
        user_id: user.id,
        url,
        display_order: maxOrder + 1,
      })
      .select()
      .single();

    if (error) throw error;

    await queryClient.invalidateQueries({ queryKey: ['user-private-apps', user.id] });
    return data;
  }, [user, apps, queryClient]);

  const updateApp = useCallback(async (id: string, updates: Partial<AppData>) => {
    const { stacks, ...appUpdates } = updates;

    // Build update object safely - only include fields permitted for client-side update
    const safeUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const permittedFields: (keyof AppData)[] = [
      'url', 'name', 'tagline', 'description', 'logo_url', 
      'category_id', 'status_id', 'hours_ideation', 'hours_building', 
      'is_visible', 'display_order', 'beta_active', 'beta_mode', 
      'beta_limit', 'beta_link', 'beta_instructions', 'tags', 'screenshots',
      'analytics_enabled', 'open_to_partnerships', 'partnership_types'
    ];

    permittedFields.forEach(field => {
      if (appUpdates[field as keyof typeof appUpdates] !== undefined) {
        safeUpdates[field] = appUpdates[field as keyof typeof appUpdates];
      }
    });

    const { error } = await supabase
      .from('apps')
      .update(safeUpdates)
      .eq('id', id);

    if (error) throw error;

    // Update stacks if provided
    if (stacks !== undefined) {
      // Delete existing stacks
      await supabase
        .from('app_stacks')
        .delete()
        .eq('app_id', id);

      // Insert new stacks
      if (stacks.length > 0) {
        const { error: stackError } = await supabase
          .from('app_stacks')
          .insert(stacks.map(stack_id => ({ app_id: id, stack_id })));

        if (stackError) throw stackError;
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['user-private-apps', user?.id] });
  }, [user?.id, queryClient]);

  const deleteApp = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await queryClient.invalidateQueries({ queryKey: ['user-private-apps', user?.id] });
  }, [user?.id, queryClient]);

  const uploadAppLogo = useCallback(async (appId: string, file: File) => {
    if (!user) throw new Error('No user');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/apps/${appId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    await updateApp(appId, { logo_url: publicUrl });
    return publicUrl;
  }, [user, updateApp]);

  const uploadAppScreenshot = useCallback(async (appId: string, file: File) => {
    if (!user) throw new Error('No user');

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const filePath = `${user.id}/apps/${appId}/screenshots/${timestamp}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  }, [user]);

  const reorderApps = useCallback(async (reorderedApps: AppData[]) => {
    const updates = reorderedApps.map((app, index) => ({
      id: app.id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('apps')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }

    await queryClient.invalidateQueries({ queryKey: ['user-private-apps', user?.id] });
  }, [user?.id, queryClient]);

  const verifyApp = useCallback(async (appId: string) => {
    const { data, error } = await supabase.functions.invoke('verify-app-domain', {
      body: { app_id: appId }
    });

    if (error) {
      console.error('Error verifying app:', error);
      return { success: false, error: 'invoke_error', message: 'Error al conectar con el servidor' };
    }

    if (data?.success) {
      // Refetch to get updated state from server
      await queryClient.invalidateQueries({ queryKey: ['user-private-apps', user?.id] });
    }

    return data;
  }, [user?.id, queryClient]);

  return {
    apps,
    loading,
    error: error instanceof Error ? error : error ? new Error('Error al cargar apps') : null,
    createApp,
    updateApp,
    deleteApp,
    uploadAppLogo,
    uploadAppScreenshot,
    reorderApps,
    refetch,
    verifyApp,
  };
}
