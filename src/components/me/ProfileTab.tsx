import { useRef, useCallback } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { ProfileSocials } from './ProfileSocials';
import { UsernameEditor } from './UsernameEditor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { PioneerBadge } from '@/components/PioneerBadge';
import { Camera, MapPin, Globe, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadAvatar: (file: File) => Promise<string>;
  onUploadBanner: (file: File) => Promise<string>;
}

export function ProfileTab({ profile, onUpdate, onUploadAvatar, onUploadBanner }: ProfileTabProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onUploadAvatar(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onUploadBanner(file);
      } catch (error) {
        console.error('Error uploading banner:', error);
      }
    }
  };

  const bioLength = profile.bio?.length || 0;

  return (
    <div className="space-y-8">
      {/* Banner Upload */}
      <section className="space-y-2">
        <Label className="text-[#1c1c1c]">Banner</Label>
        <div 
          className="relative h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
          onClick={handleBannerClick}
        >
          {profile.banner_url ? (
            <img 
              src={profile.banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ImagePlus className="h-8 w-8 mb-2" />
              <span className="text-sm">Añadir banner</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </div>
      </section>

      {/* Basic Info */}
      <section className="space-y-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="h-24 w-24 cursor-pointer border-2 border-gray-200" onClick={handleAvatarClick}>
              <AvatarImage src={profile.avatar_url || ''} alt={profile.name || 'Avatar'} />
              <AvatarFallback className="text-2xl bg-[#3D5AFE]/10 text-[#3D5AFE]">
                {profile.name?.charAt(0) || profile.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name and Username */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1c1c1c]">Nombre *</Label>
              <Input
                id="name"
                value={profile.name || ''}
                onChange={e => onUpdate({ name: e.target.value })}
                placeholder="Tu nombre completo"
                className="text-lg border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
              />
            </div>
            
            {user && (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <UsernameEditor 
                    currentUsername={profile.username}
                    onUpdate={(username) => onUpdate({ username })}
                    userId={user.id}
                  />
                </div>
                
                {/* Pioneer Badge Toggle - only show for pioneers */}
                {profile.is_pioneer && (
                  <div className="flex items-center gap-2 pt-7">
                    <PioneerBadge className="w-5 h-5" />
                    <span className="text-sm text-gray-600 whitespace-nowrap">Early Founding Member</span>
                    <Switch
                      checked={profile.show_pioneer_badge}
                      onCheckedChange={(checked) => onUpdate({ show_pioneer_badge: checked })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-[#1c1c1c]">Tagline</Label>
          <Input
            id="tagline"
            value={profile.tagline || ''}
            onChange={e => onUpdate({ tagline: e.target.value.slice(0, 100) })}
            placeholder="Una frase que te defina"
            maxLength={100}
            className="border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
          />
          <p className="text-xs text-gray-500 text-right">{profile.tagline?.length || 0}/100</p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" className="text-[#1c1c1c]">Bio</Label>
            <span className="text-xs text-gray-500">Soporta **negritas**, *italica* y listas</span>
          </div>
          <Textarea
            id="bio"
            value={profile.bio || ''}
            onChange={e => onUpdate({ bio: e.target.value.slice(0, 500) })}
            placeholder="Cuéntanos sobre ti, tus proyectos, tu experiencia..."
            className="min-h-[120px] resize-none border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right">{bioLength}/500</p>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Location & Website */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-[#1c1c1c]">
            <MapPin className="h-4 w-4 text-gray-500" />
            Ubicación
          </Label>
          <Input
            id="location"
            value={profile.location || ''}
            onChange={e => onUpdate({ location: e.target.value })}
            placeholder="Ciudad, País"
            className="border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2 text-[#1c1c1c]">
            <Globe className="h-4 w-4 text-gray-500" />
            Website
          </Label>
          <Input
            id="website"
            value={profile.website || ''}
            onChange={e => onUpdate({ website: e.target.value })}
            placeholder="https://tuwebsite.com"
            type="url"
            className="border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
          />
        </div>
      </section>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Social Networks */}
      <section>
        <h3 className="text-sm font-medium mb-4 text-[#1c1c1c]">Redes Sociales</h3>
        <ProfileSocials profile={profile} onUpdate={onUpdate} />
      </section>
    </div>
  );
}
