import { MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const t = useTranslation('common');

  return (
    <footer className="border-t border-border/30 px-4 py-8">
      <div className="container mx-auto flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {t.footer.madeIn}
        </p>
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;
