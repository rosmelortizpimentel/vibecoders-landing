import { ProfileData } from '@/hooks/useProfileEditor';
import { FontSelector } from './FontSelector';
import { ColorPicker } from './ColorPicker';
import { OgImageSection } from './OgImageSection';

interface BrandingTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
  onUploadOgImage: (file: File) => Promise<string>;
  onDeleteOgImage: () => void;
}

export function BrandingTab({ profile, onUpdate, onUploadOgImage, onDeleteOgImage }: BrandingTabProps) {
  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Typography */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[#1c1c1c]">Tipografía</h3>
          <p className="text-xs text-gray-500 mt-1">
            Esta fuente se aplicará a tu perfil público
          </p>
        </div>
        <FontSelector
          value={profile.font_family || ''}
          onChange={font => onUpdate({ font_family: font })}
        />
      </section>

      <hr className="border-gray-200" />

      {/* Colors */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[#1c1c1c]">Colores</h3>
          <p className="text-xs text-gray-500 mt-1">
            Personaliza los colores de tu perfil
          </p>
        </div>
        <ColorPicker
          label="Borde de Foto"
          value={profile.accent_color || '#FFFFFF'}
          onChange={color => onUpdate({ accent_color: color })}
        />
      </section>

      <hr className="border-gray-200" />

      {/* OG Image for Social Media */}
      <OgImageSection
        profile={profile}
        onUpload={onUploadOgImage}
        onDelete={onDeleteOgImage}
      />
    </div>
  );
}
