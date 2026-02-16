import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface GlobalShareButtonProps {
  className?: string;
  showText?: boolean;
}

export const GlobalShareButton = ({ className, showText = true }: GlobalShareButtonProps) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  // Only show if user is logged in and we have their profile (especially username)
  if (!user || loading || !profile?.username) return null;

  const handleShare = () => {
    // The share text as requested by the user
    const text = `Creé mi perfil para compartir lo que estoy construyendo y conectar con otros builders:\n\n🌐 vibecoders.la/@${profile.username}\n\n¿Tú también construyes? Hablemos.\n\n#BuildInPublic #VibeCoders`;
    
    // Construct the LinkedIn share URL
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    
    // Open in a new tab
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleShare}
      variant="ghost"
      size={showText ? "default" : "icon"}
      className={cn(
        "bg-[#0077b5] hover:bg-[#0077b5]/90 text-white shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95",
        showText ? "px-4 h-9" : "h-9 w-9 rounded-full",
        className
      )}
      aria-label="Compartir Perfil en LinkedIn"
    >
      <Linkedin className={cn("h-4 w-4 fill-current", !showText && "h-5 w-5")} />
      {showText && <span className="font-bold text-xs whitespace-nowrap">Compartir Perfil</span>}
    </Button>
  );
};
