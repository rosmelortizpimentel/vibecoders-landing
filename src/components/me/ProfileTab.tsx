import { useRef, useState } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { ProfileSocials } from './ProfileSocials';
import { UsernameEditor } from './UsernameEditor';
import { DebouncedInput } from '@/components/ui/debounced-input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { PioneerBadge } from '@/components/PioneerBadge';
import { ContributorBadge } from '@/components/ContributorBadge';
import { Camera, MapPin, Globe, ImagePlus, AlignLeft, AlignCenter, AlignRight, Trash2, Calendar, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ProBadge } from '@/components/ui/ProBadge';
import { BannerCropDialog } from './BannerCropDialog';
import { ColorPicker } from './ColorPicker';
import { FontSelector } from './FontSelector';
import { OgImageSection } from './OgImageSection';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ProfileTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadAvatar: (file: File) => Promise<string>;
  onUploadBanner: (file: File) => Promise<string>;
  onDeleteBanner?: () => void;
  onUploadOgImage: (file: File) => Promise<string>;
  onDeleteOgImage: () => void;
  isSaving?: boolean;
  error?: Error | null;
}

export function ProfileTab({ 
  profile, 
  onUpdate, 
  onUploadAvatar, 
  onUploadBanner, 
  onDeleteBanner,
  onUploadOgImage,
  onDeleteOgImage,
  isSaving,
  error 
}: ProfileTabProps) {
  const { user } = useAuth();
  const { isPro, isFounder } = useSubscription();
  const { t } = useTranslation('profile');
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
              <span className="text-sm">{t('labels.addBanner')}</span>
            </div>
          )}
          
          {/* Camera overlay with size recommendation */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white mb-1" />
            <span className="text-xs text-white/80">{t('labels.suggestedRatio')}</span>
          </div>
          
          {/* Delete button - top right corner, only with banner */}
          {profile.banner_url && (
            <button
              type="button"
              onClick={handleDeleteBanner}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 z-20"
              title={t('labels.deleteBanner')}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          )}

          {/* Banner Alignment Controls - absolutely positioned at bottom center inside banner */}
          {profile.banner_url && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-black/40 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpdate({ banner_position: 'left' }); }}
                className={cn(
                  "p-1.5 rounded-md transition-all hover:bg-white/20",
                  bannerPosition === 'left' ? "bg-white text-black shadow-sm" : "text-white/80"
                )}
                title={t('labels.bannerLeft')}
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpdate({ banner_position: 'center' }); }}
                className={cn(
                  "p-1.5 rounded-md transition-all hover:bg-white/20",
                  bannerPosition === 'center' ? "bg-white text-black shadow-sm" : "text-white/80"
                )}
                title={t('labels.bannerCenter')}
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpdate({ banner_position: 'right' }); }}
                className={cn(
                  "p-1.5 rounded-md transition-all hover:bg-white/20",
                  bannerPosition === 'right' ? "bg-white text-black shadow-sm" : "text-white/80"
                )}
                title={t('labels.bannerRight')}
              >
                <AlignRight className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </div>
        
      </section>

      {/* Basic Info - Avatar with alignment controls below */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Avatar with controls below */}
          <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
            <div className="relative group">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 cursor-pointer border-2 shadow-sm" style={{ borderColor: profile.accent_color || '#FFFFFF' }} onClick={handleAvatarClick}>
                <AvatarImage src={profile.avatar_url || ''} alt={profile.name || 'Avatar'} />
                <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                  {profile.name?.charAt(0) || profile.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              
              {/* Floating Color Picker for Image Border */}
              <div className="absolute -top-1 -right-1 z-10">
                <ColorPicker
                  value={profile.accent_color || '#FFFFFF'}
                  onChange={(color) => onUpdate({ accent_color: color })}
                  compact={true}
                />
              </div>

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
                title={t('labels.avatarLeft')}
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
                title={t('labels.avatarCenter')}
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
                title={t('labels.avatarRight')}
              >
                <AlignRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Name and Username - Side by side on desktop */}
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{t('fields.name')} *</Label>
                <DebouncedInput
                  id="name"
                  value={profile.name || ''}
                  onValueChange={value => onUpdate({ name: value })}
                  placeholder={t('placeholders.name')}
                  className="text-sm sm:text-base border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
                />
              </div>

              {user && (
                <UsernameEditor 
                  currentUsername={profile.username}
                  onUpdate={(username) => onUpdate({ username })}
                  userId={user.id}
                  isRequired={true}
                />
              )}
            </div>
            
            <div className="space-y-4">
              {/* Pioneer Badge Toggle - temporarily hidden as requested */}
              {/* 
              {profile.is_pioneer && (
                <div className="flex items-center gap-2 flex-wrap">
                  <PioneerBadge className="w-5 h-5" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{t('labels.earlyFoundingMember')}</span>
                  <div className="flex items-center gap-2 ml-auto sm:ml-2">
                    <span className="text-sm text-muted-foreground">{t('labels.showBadge')}</span>
                    <Switch
                      checked={profile.show_pioneer_badge}
                      onCheckedChange={(checked) => onUpdate({ show_pioneer_badge: checked })}
                    />
                  </div>
                </div>
              )}
              */}

              {/* Contributor Badge Toggle - only show for contributors */}
              {profile.is_contributor && (
                <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-border/50">
                  <ContributorBadge className="w-5 h-5" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Contributor</span>
                  <div className="flex items-center gap-2 ml-auto sm:ml-2">
                    <span className="text-sm text-muted-foreground">{t('labels.showBadge')}</span>
                    <Switch
                      checked={profile.show_contributor_badge}
                      onCheckedChange={(checked) => onUpdate({ show_contributor_badge: checked })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tagline — moved here, inside right column */}
            <div className="space-y-1">
              <Label htmlFor="tagline" className="text-foreground">{t('fields.tagline')}</Label>
              <DebouncedInput
                id="tagline"
                value={profile.tagline || ''}
                onValueChange={value => onUpdate({ tagline: value.slice(0, 160) })}
                placeholder={t('placeholders.tagline')}
                maxLength={160}
                className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
              />
              <p className="text-xs text-muted-foreground text-right">{profile.tagline?.length || 0}/160</p>
            </div>
          </div>
        </div>

      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Location & Website - Responsive grid */}
      <section className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {t('fields.location')}
          </Label>
          <DebouncedInput
            id="location"
            value={profile.location || ''}
            onValueChange={value => onUpdate({ location: value })}
            placeholder={t('placeholders.location')}
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2 text-foreground">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {t('fields.website')}
          </Label>
          <DebouncedInput
            id="website"
            value={profile.website || ''}
            onValueChange={value => onUpdate({ website: value })}
            placeholder={t('placeholders.website')}
            type="url"
            className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0"
          />
        </div>

        {/* Booking URL + Button Preview — side by side on desktop */}
        <div className="space-y-2 pt-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {t('fields.bookingUrl')}
            <ProBadge />
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {/* URL input */}
            <DebouncedInput
              id="booking_url"
              value={profile.booking_url || ''}
              onValueChange={value => onUpdate({ booking_url: value })}
              placeholder={t('placeholders.bookingUrl')}
              type="url"
              disabled={!(isPro || isFounder)}
              className="border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-0 disabled:opacity-50"
            />

            {/* Button preview — inline editable + color pickers */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Editable button */}
                <span
                  role="button"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newText = e.currentTarget.textContent?.trim() || '';
                    if (newText !== profile.booking_button_text) {
                      onUpdate({ booking_button_text: newText || t('placeholders.bookingButtonText') });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  style={{
                    backgroundColor: profile.primary_color || '#3D5AFE',
                    color: profile.accent_color || '#FFFFFF',
                  }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold cursor-text whitespace-nowrap shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90"
                >
                  {profile.booking_button_text || t('placeholders.bookingButtonText')}
                  <Calendar className="h-3.5 w-3.5 shrink-0 pointer-events-none" />
                </span>

                {/* Compact color pickers */}
                <div className="flex items-center gap-3">
                  <ColorPicker
                    value={profile.primary_color || '#3D5AFE'}
                    onChange={(color) => onUpdate({ primary_color: color })}
                    compact={true}
                  />
                  <ColorPicker
                    value={profile.accent_color || '#FFFFFF'}
                    onChange={(color) => onUpdate({ accent_color: color })}
                    compact={true}
                  />
                </div>

                <span className="text-[10px] text-muted-foreground italic hidden sm:inline">← {t('labels.clickToEdit')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Status / Error Feedback */}
        {(isSaving || error) && (
          <div className={cn(
            "flex items-center gap-2 text-sm p-3 rounded-lg border",
            error ? "bg-red-50 border-red-200 text-red-600" : "bg-blue-50 border-blue-200 text-blue-600"
          )}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : error ? (
              <AlertCircle className="h-4 w-4" />
            ) : null}
            <span>
              {isSaving ? t('saving') : error ? `${t('error')}: ${error.message}` : null}
            </span>
          </div>
        )}
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Social Networks */}
      <section>
        <h3 className="text-sm font-medium mb-4 text-foreground">{t('fields.socialNetworks')}</h3>
        <ProfileSocials profile={profile} onUpdate={onUpdate} />
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Chat Availability */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Chat</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cuando estés disponible, aparecerás en el directorio de chat para que otros Vibers puedan iniciarte una conversación.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Disponible para chat</p>
            <p className="text-xs text-muted-foreground mt-0.5">Aparecer en el directorio de mensajes</p>
          </div>
          <Switch
            checked={profile.chat_available ?? false}
            onCheckedChange={(checked) => onUpdate({ chat_available: checked })}
          />
        </div>
      </section>

      {/* Divider */}
      <hr className="border-border" />

      {/* Typography */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Tipografía</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Personaliza el estilo visual de tu perfil seleccionando una tipografía premium.
          </p>
        </div>
        <FontSelector
          value={profile.font_family || ''}
          onChange={font => onUpdate({ font_family: font })}
        />
      </section>


      <hr className="border-border" />

      {/* OG Image / Social Image */}
      <OgImageSection 
        profile={profile} 
        onUpload={onUploadOgImage} 
        onDelete={onDeleteOgImage} 
      />

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
