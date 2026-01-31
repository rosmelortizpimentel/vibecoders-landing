import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAutoSave } from './useAutoSave';

export interface ProfileData {
  id: string;
  username: string | null;
  member_number: number;
  name: string | null;
  tagline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  lovable: string | null;
  twitter: string | null;
  github: string | null;
  tiktok: string | null;
  instagram: string | null;
  youtube: string | null;
  linkedin: string | null;
  email_public: string | null;
  font_family: string | null;
  primary_color: string | null;
  accent_color: string | null;
  card_style: string | null;
}

const DEFAULT_PROFILE: Partial<ProfileData> = {
  font_family: 'Inter',
  primary_color: '#3D5AFE',
  accent_color: '#1c1c1c',
  card_style: 'minimal',
};

export function useProfileEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const saveProfile = useCallback(async (data: Partial<ProfileData>) => {
    if (!user) throw new Error('No user');
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username: data.username,
        name: data.name,
        tagline: data.tagline,
        bio: data.bio,
        location: data.location,
        website: data.website,
        avatar_url: data.avatar_url,
        lovable: data.lovable,
        twitter: data.twitter,
        github: data.github,
        tiktok: data.tiktok,
        instagram: data.instagram,
        youtube: data.youtube,
        linkedin: data.linkedin,
        email_public: data.email_public,
        font_family: data.font_family,
        primary_color: data.primary_color,
        accent_color: data.accent_color,
        card_style: data.card_style,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;
  }, [user]);

  const { save: autoSave, isSaving, lastSaved, error: saveError } = useAutoSave(saveProfile);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // Use Google metadata as fallback for name and avatar
        const googleName = user.user_metadata?.full_name;
        const googleAvatar = user.user_metadata?.avatar_url;
        
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          name: data.name || googleName || null,
          avatar_url: data.avatar_url || googleAvatar || null,
        } as ProfileData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error('Error al cargar perfil'));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const updateProfile = useCallback((updates: Partial<ProfileData>) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newProfile = { ...prev, ...updates };
      autoSave(newProfile);
      return newProfile;
    });
  }, [autoSave]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) throw new Error('No user');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    updateProfile({ avatar_url: publicUrl });
    return publicUrl;
  }, [user, updateProfile]);

  return {
    profile,
    loading,
    error: error || saveError,
    isSaving,
    lastSaved,
    updateProfile,
    uploadAvatar,
  };
}
