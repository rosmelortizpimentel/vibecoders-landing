import commonEs from '@/i18n/es/common.json';
import heroEs from '@/i18n/es/hero.json';
import featuresEs from '@/i18n/es/features.json';
import waitlistEs from '@/i18n/es/waitlist.json';
import legalEs from '@/i18n/es/legal.json';

type Language = 'es';

// Re-export for type inference refresh
const translations = {
  es: {
    common: commonEs,
    hero: heroEs,
    features: featuresEs,
    waitlist: waitlistEs,
    legal: legalEs,
  },
} as const;

type Translations = typeof translations;
type Section = keyof Translations['es'];

export function useTranslation<T extends Section>(section: T, lang: Language = 'es') {
  return translations[lang][section] as Translations['es'][T];
}

export function t<T extends Section>(section: T, lang: Language = 'es') {
  return translations[lang][section] as Translations['es'][T];
}
