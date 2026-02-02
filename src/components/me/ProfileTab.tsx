import { useRef } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { ProfileSocials } from './ProfileSocials';
import { UsernameEditor } from './UsernameEditor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { PioneerBadge } from '@/components/PioneerBadge';
import { Camera, MapPin, Globe, ImagePlus, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ProfileTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadAvatar: (file: File) => Promise<string>;
  onUploadBanner: (file: File) => Promise<string>;
  onDeleteBanner?: () => void;
}

export function ProfileTab({ profile, onUpdate, onUploadAvatar, onUploadBanner, onDeleteBanner }: ProfileTabProps) {
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

  const handleDeleteBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteBanner?.();
  };

  const bioLength = profile.bio?.length || 0;
  const avatarPosition = profile.avatar_position || 'center';
  const bannerPosition = profile.banner_position || 'center';

  const bannerPositionClasses = {
    left: 'object-left',
    center: 'object-center',
    right: 'object-right'
  };

  return (
    <div className="space-y-8">
      {/* Banner Upload Section */}
      <section className="space-y-2">
        <Label className="text-[#1C1C1C]">Banner</Label>
        
        {/* Banner with hover overlays */}
        <div 
          className="relative h-32 bg-muted rounded-lg overflow-hidden cursor-pointer group"
          onClick={handleBannerClick}
        >
          {profile.banner_url ? (
            <img 
              src={profile.banner_url} 
              alt="Banner" 
              className={cn("w-full h-full object-cover", bannerPositionClasses[bannerPosition])}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ImagePlus className="h-8 w-8 mb-2" />
              <span className="text-sm">Añadir banner</span>
            </div>
          )}
          
          {/* Camera overlay - center, always visible on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          
          {/* Delete button - top right corner, only with banner */}
          {profile.banner_url && (
            <button
              type="button"
              onClick={handleDeleteBanner}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              title="Eliminar banner"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          )}
          
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </div>
        
        {/* Banner Alignment Controls - only when banner exists */}
        {profile.banner_url && (
          <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-md w-fit mx-auto">
            <button
              type="button"
              onClick={() => onUpdate({ banner_position: 'left' })}
              className={cn(
                "p-1.5 rounded transition-colors",
                bannerPosition === 'left' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              title="Banner a la izquierda"
            >
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ banner_position: 'center' })}
              className={cn(
                "p-1.5 rounded transition-colors",
                bannerPosition === 'center' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              title="Banner centrado"
            >
              <AlignCenter className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ banner_position: 'right' })}
              className={cn(
                "p-1.5 rounded transition-colors",
                bannerPosition === 'right' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
              title="Banner a la derecha"
            >
              <AlignRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </section>

      {/* Basic Info - Avatar with alignment controls below */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Avatar with controls below */}
          <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
            <div className="relative group">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 cursor-pointer border-2 border-border" onClick={handleAvatarClick}>
                <AvatarImage src={profile.avatar_url || ''} alt={profile.name || 'Avatar'} />
                <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
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
            
            {/* Avatar Position Controls - below avatar */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
              <button
                type="button"
                onClick={() => onUpdate({ avatar_position: 'left' })}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  avatarPosition === 'left' ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
                title="Avatar a la izquierda"
              >
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ avatar_position: 'center' })}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  avatarPosition === 'center' ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
                title="Avatar centrado"
              >
                <AlignCenter className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ avatar_position: 'right' })}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  avatarPosition === 'right' ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
                title="Avatar a la derecha"
              >
                <AlignRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Name and Username */}
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1C1C1C]">Nombre *</Label>
              <Input
                id="name"
                value={profile.name || ''}
                onChange={e => onUpdate({ name: e.target.value })}
                placeholder="Tu nombre completo"
                className="text-base sm:text-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
              />
            </div>
            
            {user && (
              <div className="space-y-4">
                <UsernameEditor 
                  currentUsername={profile.username}
                  onUpdate={(username) => onUpdate({ username })}
                  userId={user.id}
                />
                
                {/* Pioneer Badge Toggle - only show for pioneers */}
                {profile.is_pioneer && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <PioneerBadge className="w-5 h-5" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Early Founding Member</span>
                    <div className="flex items-center gap-2 ml-auto sm:ml-2">
                      <span className="text-sm text-muted-foreground">Mostrar badge</span>
                      <Switch
                        checked={profile.show_pioneer_badge}
                        onCheckedChange={(checked) => onUpdate({ show_pioneer_badge: checked })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-[#1C1C1C]">Tagline</Label>
          <Input
            id="tagline"
            value={profile.tagline || ''}
            onChange={e => onUpdate({ tagline: e.target.value.slice(0, 100) })}
            placeholder="Una frase que te defina"
            maxLength={100}
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
          <p className="text-xs text-muted-foreground text-right">{profile.tagline?.length || 0}/100</p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <Label htmlFor="bio" className="text-[#1C1C1C]">Bio</Label>
            <span className="text-xs text-muted-foreground">Soporta **negritas**, *italica* y listas</span>
          </div>
          <Textarea
            id="bio"
            value={profile.bio || ''}
            onChange={e => onUpdate({ bio: e.target.value.slice(0, 500) })}
            placeholder="Cuéntanos sobre ti, tus proyectos, tu experiencia..."
            className="min-h-[120px] resize-none border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{bioLength}/500</p>
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Location & Website - Responsive grid */}
      <section className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-[#1C1C1C]">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Ubicación
          </Label>
          <Input
            id="location"
            value={profile.location || ''}
            onChange={e => onUpdate({ location: e.target.value })}
            placeholder="Ciudad, País"
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2 text-[#1C1C1C]">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Website
          </Label>
          <Input
            id="website"
            value={profile.website || ''}
            onChange={e => onUpdate({ website: e.target.value })}
            placeholder="https://tuwebsite.com"
            type="url"
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Social Networks */}
      <section>
        <h3 className="text-sm font-medium mb-4 text-[#1C1C1C]">Redes Sociales</h3>
        <ProfileSocials profile={profile} onUpdate={onUpdate} />
      </section>
    </div>
  );
}
