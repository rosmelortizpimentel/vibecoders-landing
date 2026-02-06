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
  variant?: 'dropdown' | 'header';
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

  if (variant === 'header') {
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
          "flex items-center gap-1.5 px-2 py-1.5 rounded-sm bg-muted text-xs font-bold transition-colors hover:bg-muted/80 border border-border/50 uppercase",
          className
        )}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{language}</span>
      </button>
    );
  }

  // Collapsible for dropdown menu (authenticated)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("w-full", className)}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2.5 px-3 text-background/80 hover:bg-background hover:text-foreground transition-colors group">
        <Globe className="h-4 w-4" />
        <span className="flex-1 text-left">
          {language === 'es' ? 'Idioma' : 
           language === 'fr' ? 'Langue' :
           language === 'pt' ? 'Idioma' : 'Language'}: 
          <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-background/20 text-[10px] font-bold border border-background/30 uppercase">
            {language}
          </span>
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-2 space-y-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 w-full py-2 px-3 rounded-sm text-sm transition-colors",
              language === lang.code
                ? "bg-background/20 text-background font-bold border border-background/30"
                : "text-background/60 hover:text-background hover:bg-background/10"
            )}
          >
            <span className="text-[10px] font-mono tracking-tight w-5">{lang.code.toUpperCase()}</span>
            <span className="flex-1 text-left">{lang.label}</span>
            {language === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-background" />}
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
