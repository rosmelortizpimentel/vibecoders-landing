import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAutoSave } from './useAutoSave';
import { useProfile } from './useProfile';

export interface ProfileData {
  id: string;
  username: string | null;
  member_number: number;
  is_pioneer: boolean;
  show_pioneer_badge: boolean;
  name: string | null;
  tagline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  booking_url: string | null;
  booking_button_text: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  og_image_url: string | null;
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
  avatar_position: 'left' | 'center' | 'right' | null;
  banner_position: 'left' | 'center' | 'right' | null;
  is_contributor: boolean;
  show_contributor_badge: boolean;
  allow_analytics: boolean;
  allow_marketing: boolean;
  chat_available: boolean;
}

const DEFAULT_PROFILE: Partial<ProfileData> = {
  font_family: '',
  primary_color: '#3D5AFE',
  accent_color: '#FFFFFF',
  card_style: 'minimal',
  avatar_position: 'center',
  banner_position: 'center',
  is_contributor: false,
  show_contributor_badge: false,
  allow_analytics: false,
  allow_marketing: false,
  chat_available: false,
};

export function useProfileEditor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { profile: cachedProfile, loading: initialLoading } = useProfile();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize editor state from cached profile
  useEffect(() => {
    if (cachedProfile && !profile) {
      setProfile({
        ...DEFAULT_PROFILE,
        ...cachedProfile,
      } as ProfileData);
      setLoading(false);
    } else if (!initialLoading && !cachedProfile) {
      setLoading(false);
    }
  }, [cachedProfile, initialLoading, profile]);

  const saveProfile = useCallback(async (data: Partial<ProfileData>) => {
    if (!user) throw new Error('No user');
    
    // Build update object safely - only include fields if they are defined
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    const fields: (keyof ProfileData)[] = [
      'username', 'show_pioneer_badge', 'show_contributor_badge', 'name', 
      'tagline', 'bio', 'location', 'website', 'booking_url', 
      'booking_button_text', 'avatar_url', 'banner_url', 'og_image_url', 
      'lovable', 'twitter', 'github', 'tiktok', 'instagram', 'youtube', 
      'linkedin', 'email_public', 'font_family', 'primary_color', 
      'accent_color', 'card_style', 'avatar_position', 'banner_position',
      'allow_analytics', 'allow_marketing', 'chat_available'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Supabase profile update error:', error);
      throw error;
    }
    
    // Invalidate profile cache
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
  }, [user, queryClient]);

  const { save: autoSave, isSaving, lastSaved, error: saveError } = useAutoSave(saveProfile);

  // Sync user state changes if needed
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setProfile(null);
    }
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
    const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

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

  const uploadBanner = useCallback(async (file: File) => {
    if (!user) throw new Error('No user');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/banner_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);

    updateProfile({ banner_url: publicUrl });
    return publicUrl;
  }, [user, updateProfile]);

  const deleteBanner = useCallback(() => {
    updateProfile({ banner_url: null });
  }, [updateProfile]);

  const uploadOgImage = useCallback(async (file: File) => {
    if (!user) throw new Error('No user authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `og_image_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Attempting to upload OG image to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('profile-assets')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-assets')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);

      updateProfile({ og_image_url: publicUrl });
      return publicUrl;
    } catch (err) {
      console.error('Failed to upload OG image:', err);
      throw err;
    }
  }, [user, updateProfile]);

  const deleteOgImage = useCallback(() => {
    updateProfile({ og_image_url: null });
  }, [updateProfile]);

  return {
    profile,
    loading,
    error: error || saveError,
    isSaving,
    lastSaved,
    updateProfile,
    uploadAvatar,
    uploadBanner,
    deleteBanner,
    uploadOgImage,
    deleteOgImage,
  };
}
