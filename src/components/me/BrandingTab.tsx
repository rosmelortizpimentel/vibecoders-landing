import { ProfileData } from '@/hooks/useProfileEditor';
import { FontSelector } from './FontSelector';
import { ColorPicker } from './ColorPicker';
import { CardStyleSelector } from './CardStyleSelector';

interface BrandingTabProps {
  profile: ProfileData | null;
  onUpdate: (updates: Partial<ProfileData>) => void;
}

export function BrandingTab({ profile, onUpdate }: BrandingTabProps) {
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
          value={profile.font_family || 'Inter'}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorPicker
            label="Color Primario"
            value={profile.primary_color || '#3D5AFE'}
            onChange={color => onUpdate({ primary_color: color })}
          />
          <ColorPicker
            label="Color Acento"
            value={profile.accent_color || '#1c1c1c'}
            onChange={color => onUpdate({ accent_color: color })}
          />
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* Card Style */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[#1c1c1c]">Estilo de Tarjetas</h3>
          <p className="text-xs text-gray-500 mt-1">
            Elige cómo se verán las tarjetas de tus apps
          </p>
        </div>
        <CardStyleSelector
          value={profile.card_style || 'minimal'}
          onChange={style => onUpdate({ card_style: style })}
        />
      </section>
    </div>
  );
}
