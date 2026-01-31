import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';

const Privacy = () => {
  const t = useTranslation('legal');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.backToHome}
          </Link>
          <Link to="/" className="font-display text-lg font-semibold text-foreground">
            {t.common.logo}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {t.privacy.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t.privacy.lastUpdated}
        </p>

        <div className="space-y-8">
          {t.privacy.sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
              {section.list && (
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  {section.list.map((item, i) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
              {section.footer && (
                <p className="text-muted-foreground leading-relaxed">
                  {section.footer}
                </p>
              )}
              {section.email && (
                <a 
                  href={`mailto:${section.email}`}
                  className="text-primary hover:underline"
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
