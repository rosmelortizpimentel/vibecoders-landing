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

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher({ variant = 'dropdown', className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === language) || languages[0];

  if (variant === 'header') {
    // Simple toggle for header (non-authenticated)
    return (
      <button
        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10",
          className
        )}
        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{language}</span>
      </button>
    );
  }

  // Collapsible for dropdown menu (authenticated)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2.5 px-3 text-background/80 hover:bg-background hover:text-foreground transition-colors">
        <Globe className="h-4 w-4" />
        <span className="flex-1 text-left">
          {language === 'es' ? 'Idioma' : 'Language'}: {currentLang.flag} {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-9 pr-3 pb-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 w-full py-2 px-2 rounded text-sm transition-colors",
              language === lang.code
                ? "text-background font-medium"
                : "text-background/60 hover:text-background hover:bg-background/10"
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.code && <Check className="h-3.5 w-3.5 ml-auto" />}
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
