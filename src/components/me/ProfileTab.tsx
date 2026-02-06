import { useRef, useState } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { ProfileSocials } from './ProfileSocials';
import { UsernameEditor } from './UsernameEditor';
import { DebouncedInput } from '@/components/ui/debounced-input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { PioneerBadge } from '@/components/PioneerBadge';
import { ContributorBadge } from '@/components/ContributorBadge';
import { Camera, MapPin, Globe, ImagePlus, AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { BannerCropDialog } from './BannerCropDialog';

interface ProfileTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadAvatar: (file: File) => Promise<string>;
  onUploadBanner: (file: File) => Promise<string>;
  onDeleteBanner?: () => void;
}

export function ProfileTab({ profile, onUpdate, onUploadAvatar, onUploadBanner, onDeleteBanner }: ProfileTabProps) {
  const { user } = useAuth();
  const t = useTranslation('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  if (!profile) return null;

  const avatarPosition = profile.avatar_position || 'center';
  const bannerPosition = profile.banner_position || 'center';

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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCropImageSrc(objectUrl);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropImageSrc(null);
    try {
      const file = new File([blob], `banner_cropped.webp`, { type: 'image/webp' });
      await onUploadBanner(file);
    } catch (error) {
      console.error('Error uploading cropped banner:', error);
    }
  };

  const handleDeleteBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteBanner?.();
  };

  // Banner position classes (flexbox alignment for contain mode)
  const bannerPositionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className="space-y-8">
      {/* Banner Upload Section */}
      <section className="space-y-2">
        <Label className="text-foreground">{t.fields.banner}</Label>
        
        {/* Banner with hover overlays - 4:1 aspect ratio (1584x396) */}
        <div 
          className="relative aspect-[4/1] bg-muted rounded-lg overflow-hidden cursor-pointer group"
          onClick={handleBannerClick}
        >
          {profile.banner_url ? (
            <div className={`w-full h-full flex items-center ${bannerPositionClasses[bannerPosition]}`}>
              <img 
                src={profile.banner_url} 
                alt="Banner" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ImagePlus className="h-8 w-8 mb-2" />
              <span className="text-sm">{t.labels.addBanner}</span>
            </div>
          )}
          
          {/* Camera overlay with size recommendation */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white mb-1" />
            <span className="text-xs text-white/80">{t.labels.suggestedRatio}</span>
          </div>
          
          {/* Delete button - top right corner, only with banner */}
          {profile.banner_url && (
            <button
              type="button"
              onClick={handleDeleteBanner}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              title={t.labels.deleteBanner}
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
              title={t.labels.bannerLeft}
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
              title={t.labels.bannerCenter}
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
              title={t.labels.bannerRight}
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
                title={t.labels.avatarLeft}
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
                title={t.labels.avatarCenter}
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
                title={t.labels.avatarRight}
              >
                <AlignRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Name and Username */}
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">{t.fields.name} *</Label>
              <DebouncedInput
                id="name"
                value={profile.name || ''}
                onValueChange={value => onUpdate({ name: value })}
                placeholder={t.placeholders.name}
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
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{t.labels.earlyFoundingMember}</span>
                    <div className="flex items-center gap-2 ml-auto sm:ml-2">
                      <span className="text-sm text-muted-foreground">{t.labels.showBadge}</span>
                      <Switch
                        checked={profile.show_pioneer_badge}
                        onCheckedChange={(checked) => onUpdate({ show_pioneer_badge: checked })}
                      />
                    </div>
                  </div>
                )}

                {/* Contributor Badge Toggle - only show for contributors */}
                {profile.is_contributor && (
                  <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-border/50">
                    <ContributorBadge className="w-5 h-5" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Contributor</span>
                    <div className="flex items-center gap-2 ml-auto sm:ml-2">
                      <span className="text-sm text-muted-foreground">{t.labels.showBadge}</span>
                      <Switch
                        checked={profile.show_contributor_badge}
                        onCheckedChange={(checked) => onUpdate({ show_contributor_badge: checked })}
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
          <Label htmlFor="tagline" className="text-foreground">{t.fields.tagline}</Label>
          <DebouncedInput
            id="tagline"
            value={profile.tagline || ''}
            onValueChange={value => onUpdate({ tagline: value.slice(0, 160) })}
            placeholder={t.placeholders.tagline}
            maxLength={160}
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
          <p className="text-xs text-muted-foreground text-right">{profile.tagline?.length || 0}/160</p>
        </div>

      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Location & Website - Responsive grid */}
      <section className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t.fields.location}
          </Label>
          <DebouncedInput
            id="location"
            value={profile.location || ''}
            onValueChange={value => onUpdate({ location: value })}
            placeholder={t.placeholders.location}
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2 text-foreground">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {t.fields.website}
          </Label>
          <DebouncedInput
            id="website"
            value={profile.website || ''}
            onValueChange={value => onUpdate({ website: value })}
            placeholder={t.placeholders.website}
            type="url"
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Social Networks */}
      <section>
        <h3 className="text-sm font-medium mb-4 text-foreground">{t.fields.socialNetworks}</h3>
        <ProfileSocials profile={profile} onUpdate={onUpdate} />
      </section>

      {/* Banner Crop Dialog */}
      {cropImageSrc && (
        <BannerCropDialog
          open={!!cropImageSrc}
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
