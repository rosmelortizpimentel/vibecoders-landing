import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';

const Privacy = () => {
  const t = useTranslation('legal');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Blue with white text */}
      <header className="bg-[#3D5AFE]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.backToHome}
          </Link>
          <Link to="/" className="font-display text-lg font-semibold text-white">
            {t.common.logo}
          </Link>
        </div>
      </header>

      {/* Content - White background */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1c1c1c] mb-2">
          {t.privacy.title}
        </h1>
        <p className="text-sm text-[#1c1c1c]/50 mb-8">
          {t.privacy.lastUpdated}
        </p>

        <div className="space-y-8">
          {t.privacy.sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-[#1c1c1c]">
                {section.title}
              </h2>
              <p className="text-[#1c1c1c]/70 leading-relaxed">
                {section.content}
              </p>
              {section.list && (
                <ul className="list-disc list-inside space-y-1 text-[#1c1c1c]/70 ml-2">
                  {section.list.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
              {section.footer && (
                <p className="text-[#1c1c1c]/70 leading-relaxed">
                  {section.footer}
                </p>
              )}
              {section.email && (
                <a 
                  href={`mailto:${section.email}`}
                  className="text-[#3D5AFE] hover:underline"
                >
                  {section.email}
                </a>
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
