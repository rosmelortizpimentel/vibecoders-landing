import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Language = 'es' | 'en' | 'fr' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'vibecoders_language';

function detectBrowserLanguage(): Language {
  const browserLang = (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase();
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('pt')) return 'pt';
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Initial: check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (['es', 'en', 'fr', 'pt'].includes(stored || '')) return stored as Language;
    return 'en'; // Force English as default regardless of browser language if no storage exists, as per user request
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync with database when user is authenticated
  useEffect(() => {
    async function syncLanguageFromDB() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.language && ['es', 'en', 'fr', 'pt'].includes(data.language)) {
          setLanguageState(data.language as Language);
          localStorage.setItem(STORAGE_KEY, data.language);
        } else {
          // No language set in DB, save default
          const defaultLang = 'en';
          await supabase
            .from('profiles')
            .update({ language: defaultLang })
            .eq('id', user.id);
          
          setLanguageState(defaultLang);
          localStorage.setItem(STORAGE_KEY, defaultLang);
        }
      } catch (err) {
        console.error('Error syncing language:', err);
      } finally {
        setIsLoading(false);
      }
    }

    syncLanguageFromDB();
  }, [user]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);

    // Persist to database if user is authenticated
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ language: lang })
          .eq('id', user.id);
      } catch (err) {
        console.error('Error saving language preference:', err);
      }
    }
  }, [user]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
