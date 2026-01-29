import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const t = useTranslation('common');

  return (
    <footer className="border-t border-stone-200 bg-[#F6F5F4] px-4 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <p className="text-stone-500">{t.footer.copyright}</p>
        <p className="text-stone-500">
          {t.footer.builtAt}{' '}
          <span className="font-semibold text-stone-700">{t.footer.temperature}</span>{' '}
          {t.footer.inCanada} 🇨🇦 {t.footer.by}{' '}
          <a
            href={t.footer.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-700 underline-offset-4 transition-colors hover:text-stone-900 hover:underline"
          >
            {t.footer.authorName}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
