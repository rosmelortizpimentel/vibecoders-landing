import { ProfileData } from '@/hooks/useProfileEditor';
import { FontSelector } from './FontSelector';
import { ColorPicker } from './ColorPicker';
import { OgImageSection } from './OgImageSection';
import { useTranslation } from '@/hooks/useTranslation';

interface BrandingTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadOgImage: (file: File) => Promise<string>;
  onDeleteOgImage: () => void;
}

export function BrandingTab({ profile, onUpdate, onUploadOgImage, onDeleteOgImage }: BrandingTabProps) {
  const t = useTranslation('branding');
  
  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Typography */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t.typography.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t.typography.description}
          </p>
        </div>
        <FontSelector
          value={profile.font_family || ''}
          onChange={font => onUpdate({ font_family: font })}
        />
      </section>

      <hr className="border-border" />

      {/* Colors */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t.colors.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t.colors.description}
          </p>
        </div>
        <ColorPicker
          label={t.colors.photoBorder}
          value={profile.accent_color || '#FFFFFF'}
          onChange={color => onUpdate({ accent_color: color })}
        />
      </section>

      <hr className="border-border" />

      {/* OG Image for Social Media */}
      <OgImageSection
        profile={profile}
        onUpload={onUploadOgImage}
        onDelete={onDeleteOgImage}
      />
    </div>
  );
}
