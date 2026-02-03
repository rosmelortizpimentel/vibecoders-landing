import { Link } from 'react-router-dom';
import { Linkedin, Crown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import vibecodersLogo from '@/assets/vibecoders-logo.png';

const Navbar = () => {
  const t = useTranslation('common');
  const { user } = useAuth();
  const { isInWaitlist } = useWaitlistStatus();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a 
          href="/" 
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src={vibecodersLogo} 
            alt="Vibecoders" 
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
          />
        </a>

        <div className="flex items-center gap-4">
          {/* Build Log link - only for logged in waitlist users */}
          {user && isInWaitlist && (
            <Link
              to="/buildlog"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Build Log</span>
            </Link>
          )}

          <a
            href="https://www.linkedin.com/in/rosmelortiz/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-white/80 transition-all duration-200 hover:bg-muted hover:text-secondary hover:glow-cyan"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
