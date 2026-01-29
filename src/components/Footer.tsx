import { useTranslation } from '@/hooks/useTranslation';
import canadaFlag from '@/assets/canada-flag.png';

const Footer = () => {
  const t = useTranslation('common');

  return (
    <footer className="bg-[#1c1c1c] px-4 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <p className="text-white/70">{t.footer.copyright}</p>
        <p className="flex items-center gap-1.5 text-white/70">
          {t.footer.builtAt}{' '}
          <span className="font-semibold text-white">{t.footer.temperature}</span>{' '}
          {t.footer.inCanada}{' '}
          <img 
            src={canadaFlag} 
            alt="Bandera de Canadá" 
            className="inline-block h-4 w-auto"
          />{' '}
          {t.footer.by}{' '}
          <a
            href={t.footer.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white underline-offset-4 transition-colors hover:text-white/80 hover:underline"
          >
            {t.footer.authorName}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
