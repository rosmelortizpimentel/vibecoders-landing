import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import canadaFlag from '@/assets/canada-flag.png';

const Footer = () => {
  const t = useTranslation('common');

  return (
    <footer className="bg-[#1c1c1c] px-4 py-8 sm:py-8">
      <div className="container mx-auto flex flex-col-reverse items-center justify-between gap-4 text-xs sm:flex-row sm:text-sm">
        {/* Left: Copyright + Legal links */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <p className="text-white/70">{t.footer.copyright}</p>
          <div className="flex items-center gap-3">
            <Link 
              to="/privacy" 
              className="text-white/70 hover:text-white transition-colors"
            >
              {t.footer.privacy}
            </Link>
            <span className="text-white/40">·</span>
            <Link 
              to="/terms" 
              className="text-white/70 hover:text-white transition-colors"
            >
              {t.footer.terms}
            </Link>
            <span className="text-white/40">·</span>
            <Link 
              to="/cookies" 
              className="text-white/70 hover:text-white transition-colors"
            >
              {t.footer.cookies}
            </Link>
          </div>
        </div>
        
        {/* Right: Built info */}
        <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:gap-1.5">
          <p className="flex items-center gap-1.5 text-white/70">
            {t.footer.builtWith}{' '}
            <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
            {' '}{t.footer.in}{' '}
            <img 
              src={canadaFlag} 
              alt="Canada" 
              className="inline-block h-4 w-auto"
            />
          </p>
          <p className="flex items-center gap-1.5 text-white/70">
            {t.footer.by}{' '}
            <a
              href="https://www.vibecoders.la/@rosmelortiz"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80"
            >
              {t.footer.authorName}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
