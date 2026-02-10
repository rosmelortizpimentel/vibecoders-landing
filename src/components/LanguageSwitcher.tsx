import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'header' | 'mobile';
  className?: string;
}

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
];

export function LanguageSwitcher({ variant = 'dropdown', className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === language) || languages[0];

  if (variant === 'header' || variant === 'mobile') {
    // Simple toggle for header (non-authenticated) - Cycle through languages
    const nextLang = () => {
      const currentIndex = languages.findIndex(l => l.code === language);
      const nextIndex = (currentIndex + 1) % languages.length;
      setLanguage(languages[nextIndex].code);
    };

    return (
      <button
        onClick={nextLang}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm font-medium transition-colors hover:bg-muted border border-border/50",
          variant === 'mobile' ? "w-full justify-between" : "",
          className
        )}
        style={{ color: '#1c1c1c' }}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" style={{ color: '#1c1c1c' }} />
          <span>{variant === 'mobile' ? currentLang.label : language.toUpperCase()}</span>
        </div>
        {variant === 'mobile' && <ChevronDown className="h-4 w-4" style={{ color: '#1c1c1c' }} />}
      </button>
    );
  }

  // Collapsible for dropdown menu (authenticated)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("w-full", className)}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full py-3 px-5 text-white/70 hover:bg-white/10 hover:text-white transition-all group outline-none">
        <Globe className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
        <span className="flex-1 text-left text-sm font-medium">
          {language === 'es' ? 'Idioma' : 
           language === 'fr' ? 'Langue' :
           language === 'pt' ? 'Idioma' : 'Language'}: 
          <span className="ml-2 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold border border-white/10 uppercase text-white/90">
            {language}
          </span>
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-white/20 transition-transform duration-200 group-hover:text-white/40",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-5 pb-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 w-full py-2.5 px-4 rounded-xl text-sm transition-all relative overflow-hidden",
              language === lang.code
                ? "bg-white/10 text-white font-bold border border-white/10"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="text-[10px] font-mono tracking-tight w-6 opacity-60 uppercase">{lang.code}</span>
            <span className="flex-1 text-left">{lang.label}</span>
            {language === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
