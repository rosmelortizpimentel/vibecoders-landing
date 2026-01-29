import { Linkedin } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const Navbar = () => {
  const t = useTranslation('common');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <a 
          href="/" 
          className="text-xl font-bold tracking-tight text-white transition-colors hover:text-primary md:text-2xl"
        >
          {t.navbar.logo}
        </a>

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
    </nav>
  );
};

export default Navbar;
