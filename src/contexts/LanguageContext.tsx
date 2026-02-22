import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

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

  const { profile, loading: profileLoading } = useProfile();

  // Sync with database when profile is loaded
  useEffect(() => {
    if (profileLoading) return;
    
    const profileData = profile as any; // Safe cast for dynamic fields until interface is fully updated
    
    if (profileData?.language && ['es', 'en', 'fr', 'pt'].includes(profileData.language)) {
      setLanguageState(profileData.language as Language);
      localStorage.setItem(STORAGE_KEY, profileData.language);
      setIsLoading(false);
    } else if (profile) {
      // No language set in DB for this profile, save default
      const defaultLang = 'en';
      supabase
        .from('profiles')
        .update({ language: defaultLang })
        .eq('id', profile.id)
        .then(() => {
          setLanguageState(defaultLang);
          localStorage.setItem(STORAGE_KEY, defaultLang);
          setIsLoading(false);
        });
    } else if (!user) {
      setIsLoading(false);
    }
  }, [profile, profileLoading, user]);

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
