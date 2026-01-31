import { useState } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Github, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail,
  Trash2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import lovableIcon from '@/assets/logos/lovable-icon.png';

// X icon (current logo)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

// Lovable icon component
const LovableIcon = ({ className }: { className?: string }) => (
  <img src={lovableIcon} alt="Lovable" className={className} />
);

interface ProfileSocialsProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
}

const socialFields = [
  { key: 'lovable', label: 'Lovable', icon: LovableIcon, placeholder: 'https://lovable.dev/@usuario' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/usuario' },
  { key: 'twitter', label: 'X', icon: XIcon, placeholder: 'https://x.com/usuario' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/usuario' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@canal' },
  { key: 'tiktok', label: 'TikTok', icon: TikTokIcon, placeholder: 'https://tiktok.com/@usuario' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/usuario' },
  { key: 'email_public', label: 'Email', icon: Mail, placeholder: 'email@ejemplo.com' },
] as const;

type SocialKey = typeof socialFields[number]['key'];

export function ProfileSocials({ profile, onUpdate }: ProfileSocialsProps) {
  const [selectedKey, setSelectedKey] = useState<SocialKey | null>(null);

  const handleIconClick = (key: SocialKey) => {
    setSelectedKey(prev => prev === key ? null : key);
  };

  const handleDelete = (key: SocialKey) => {
    onUpdate({ [key]: '' });
    setSelectedKey(null);
  };

  const selectedField = socialFields.find(f => f.key === selectedKey);

  return (
    <div className="space-y-4">
      {/* Icon row */}
      <div className="flex flex-wrap gap-2">
        {socialFields.map(({ key, label, icon: Icon }) => {
          const hasValue = Boolean(profile[key]);
          const isSelected = selectedKey === key;
          
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleIconClick(key)}
              className={cn(
                'relative w-12 h-12 flex items-center justify-center rounded-xl transition-all',
                isSelected
                  ? 'bg-[#1c1c1c] text-white shadow-md'
                  : hasValue
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              )}
              aria-label={label}
              title={label}
            >
              <Icon className="h-5 w-5" />
              {hasValue && !isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expandable input for selected social */}
      {selectedField && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="text-sm font-medium text-[#1c1c1c]">
            {selectedField.label}
          </label>
          <div className="flex gap-2">
            <Input
              value={(profile[selectedField.key] as string) || ''}
              onChange={e => onUpdate({ [selectedField.key]: e.target.value })}
              placeholder={selectedField.placeholder}
              className="flex-1 bg-white border border-gray-200 text-[#1c1c1c] focus:border-[#3D5AFE] focus:outline-none focus:ring-0"
              autoFocus
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleDelete(selectedField.key)}
              className="shrink-0 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50"
              aria-label={`Eliminar ${selectedField.label}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
