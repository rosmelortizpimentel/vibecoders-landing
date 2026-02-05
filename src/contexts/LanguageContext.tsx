import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'vibecoders_language';

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Initial: check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
    return detectBrowserLanguage();
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

        if (data?.language && (data.language === 'es' || data.language === 'en')) {
          setLanguageState(data.language);
          localStorage.setItem(STORAGE_KEY, data.language);
        } else {
          // No language set in DB, save browser detection
          const browserLang = detectBrowserLanguage();
          await supabase
            .from('profiles')
            .update({ language: browserLang })
            .eq('id', user.id);
          
          setLanguageState(browserLang);
          localStorage.setItem(STORAGE_KEY, browserLang);
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
