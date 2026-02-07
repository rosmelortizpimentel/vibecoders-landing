import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  // Beta fields
  beta_active: boolean;
  beta_mode: string;
  beta_limit: number;
  beta_link: string | null;
  beta_instructions: string | null;
}

export function useApps() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApps = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          app_stacks(stack_id)
        `)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const appsWithStacks = data?.map(app => ({
        ...app,
        stacks: app.app_stacks?.map((s: { stack_id: string }) => s.stack_id) || [],
         screenshots: app.screenshots || [],
      })) || [];

      setApps(appsWithStacks);
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar apps'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

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

    setApps(prev => [...prev, { ...data, stacks: [], screenshots: [] }]);
    return data;
  }, [user, apps]);

  const updateApp = useCallback(async (id: string, updates: Partial<AppData>) => {
    const { stacks, ...appUpdates } = updates;

    const { error } = await supabase
      .from('apps')
      .update({
        ...appUpdates,
        updated_at: new Date().toISOString(),
      })
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

    setApps(prev => prev.map(app => 
      app.id === id 
        ? { ...app, ...updates, stacks: stacks ?? app.stacks }
        : app
    ));
  }, []);

  const deleteApp = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setApps(prev => prev.filter(app => app.id !== id));
  }, []);

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

    setApps(reorderedApps.map((app, index) => ({ ...app, display_order: index })));
  }, []);

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
       await fetchApps();
     }
 
     return data;
   }, [fetchApps]);
 
  return {
    apps,
    loading,
    error,
    createApp,
    updateApp,
    deleteApp,
    uploadAppLogo,
    uploadAppScreenshot,
    reorderApps,
    refetch: fetchApps,
     verifyApp,
  };
}
