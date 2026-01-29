import { useTranslation } from '@/hooks/useTranslation';

const CanadaFlag = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 40 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Bandera de Canadá"
  >
    <rect width="10" height="20" fill="#FF0000" />
    <rect x="10" width="20" height="20" fill="#FFFFFF" />
    <rect x="30" width="10" height="20" fill="#FF0000" />
    <path
      fill="#FF0000"
      d="M20,3.5 L20.5,5.5 L19,6.5 L20,6.5 L19,8 L20,7.5 L20,9 L20.5,8 L21,9 L21,7.5 L22,8 L21,6.5 L22,6.5 L20.5,5.5 L21,3.5 L20.5,4.5 L20,3.5 Z"
      transform="translate(-0.5, 1.5) scale(1.1)"
    />
  </svg>
);

const Footer = () => {
  const t = useTranslation('common');

  return (
    <footer className="border-t border-stone-200 bg-[#F6F5F4] px-4 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <p className="text-stone-500">{t.footer.copyright}</p>
        <p className="flex items-center gap-1 text-stone-500">
          {t.footer.builtAt}{' '}
          <span className="font-semibold text-stone-700">{t.footer.temperature}</span>{' '}
          {t.footer.inCanada}{' '}
          <CanadaFlag className="inline-block h-3.5 w-7 rounded-sm shadow-sm" />{' '}
          {t.footer.by}{' '}
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
