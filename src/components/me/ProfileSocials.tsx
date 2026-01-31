import { ProfileData } from '@/hooks/useProfileEditor';
import { Input } from '@/components/ui/input';
import { 
  Twitter, 
  Github, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail
} from 'lucide-react';

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

interface ProfileSocialsProps {
  profile: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => void;
}

const socialFields = [
  { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: '@usuario' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'username' },
  { key: 'tiktok', label: 'TikTok', icon: TikTokIcon, placeholder: '@usuario' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@usuario' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: '@canal o URL' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'URL del perfil' },
  { key: 'email_public', label: 'Email', icon: Mail, placeholder: 'email@ejemplo.com' },
] as const;

export function ProfileSocials({ profile, onUpdate }: ProfileSocialsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
        <div key={key} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            value={(profile[key] as string) || ''}
            onChange={e => onUpdate({ [key]: e.target.value })}
            placeholder={placeholder}
            className="flex-1"
            aria-label={label}
          />
        </div>
      ))}
    </div>
  );
}
