import { useRef } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { ProfileSocials } from './ProfileSocials';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, MapPin, Globe } from 'lucide-react';

interface ProfileTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadAvatar: (file: File) => Promise<string>;
}

export function ProfileTab({ profile, onUpdate, onUploadAvatar }: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

  const bioLength = profile.bio?.length || 0;

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="space-y-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={profile.avatar_url || ''} alt={profile.name || 'Avatar'} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
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

          {/* Name */}
          <div className="flex-1 space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={profile.name || ''}
              onChange={e => onUpdate({ name: e.target.value })}
              placeholder="Tu nombre completo"
              className="text-lg"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={profile.tagline || ''}
            onChange={e => onUpdate({ tagline: e.target.value.slice(0, 100) })}
            placeholder="Una frase que te defina"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">{profile.tagline?.length || 0}/100</p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio</Label>
            <span className="text-xs text-muted-foreground">Soporta **negritas**, *italica* y listas</span>
          </div>
          <Textarea
            id="bio"
            value={profile.bio || ''}
            onChange={e => onUpdate({ bio: e.target.value.slice(0, 500) })}
            placeholder="Cuéntanos sobre ti, tus proyectos, tu experiencia..."
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{bioLength}/500</p>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Location & Website */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ubicación
          </Label>
          <Input
            id="location"
            value={profile.location || ''}
            onChange={e => onUpdate({ location: e.target.value })}
            placeholder="Ciudad, País"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </Label>
          <Input
            id="website"
            value={profile.website || ''}
            onChange={e => onUpdate({ website: e.target.value })}
            placeholder="https://tuwebsite.com"
            type="url"
          />
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Social Networks */}
      <section>
        <h3 className="text-sm font-medium mb-4">Redes Sociales</h3>
        <ProfileSocials profile={profile} onUpdate={onUpdate} />
      </section>
    </div>
  );
}
