import { useLanguage, Language } from '@/contexts/LanguageContext';

// Spanish imports
import commonEs from '@/i18n/es/common.json';
import heroEs from '@/i18n/es/hero.json';
import featuresEs from '@/i18n/es/features.json';
import waitlistEs from '@/i18n/es/waitlist.json';
import legalEs from '@/i18n/es/legal.json';
import authEs from '@/i18n/es/auth.json';
import profileEs from '@/i18n/es/profile.json';
import appsEs from '@/i18n/es/apps.json';
import brandingEs from '@/i18n/es/branding.json';
import homeEs from '@/i18n/es/home.json';
import projectsEs from '@/i18n/es/projects.json';
import toolsEs from '@/i18n/es/tools.json';
import buildlogEs from '@/i18n/es/buildlog.json';
import publicProfileEs from '@/i18n/es/publicProfile.json';
import followersEs from '@/i18n/es/followers.json';
import onboardingEs from '@/i18n/es/onboarding.json';
import errorsEs from '@/i18n/es/errors.json';
import adminEs from '@/i18n/es/admin.json';

// English imports
import commonEn from '@/i18n/en/common.json';
import heroEn from '@/i18n/en/hero.json';
import featuresEn from '@/i18n/en/features.json';
import waitlistEn from '@/i18n/en/waitlist.json';
import legalEn from '@/i18n/en/legal.json';
import authEn from '@/i18n/en/auth.json';
import profileEn from '@/i18n/en/profile.json';
import appsEn from '@/i18n/en/apps.json';
import brandingEn from '@/i18n/en/branding.json';
import homeEn from '@/i18n/en/home.json';
import projectsEn from '@/i18n/en/projects.json';
import toolsEn from '@/i18n/en/tools.json';
import buildlogEn from '@/i18n/en/buildlog.json';
import publicProfileEn from '@/i18n/en/publicProfile.json';
import followersEn from '@/i18n/en/followers.json';
import onboardingEn from '@/i18n/en/onboarding.json';
import errorsEn from '@/i18n/en/errors.json';
import adminEn from '@/i18n/en/admin.json';

const translations = {
  es: {
    common: commonEs,
    hero: heroEs,
    features: featuresEs,
    waitlist: waitlistEs,
    legal: legalEs,
    auth: authEs,
    profile: profileEs,
    apps: appsEs,
    branding: brandingEs,
    home: homeEs,
    projects: projectsEs,
    tools: toolsEs,
    buildlog: buildlogEs,
    publicProfile: publicProfileEs,
    followers: followersEs,
    onboarding: onboardingEs,
    errors: errorsEs,
    admin: adminEs,
  },
  en: {
    common: commonEn,
    hero: heroEn,
    features: featuresEn,
    waitlist: waitlistEn,
    legal: legalEn,
    auth: authEn,
    profile: profileEn,
    apps: appsEn,
    branding: brandingEn,
    home: homeEn,
    projects: projectsEn,
    tools: toolsEn,
    buildlog: buildlogEn,
    publicProfile: publicProfileEn,
    followers: followersEn,
    onboarding: onboardingEn,
    errors: errorsEn,
    admin: adminEn,
  },
} as const;

type Section = keyof typeof translations['es'];

export function useTranslation<T extends Section>(section: T) {
  const { language } = useLanguage();
  // Using any to avoid complex type inference issues with dynamic imports
  return translations[language][section] as any;
}

// Static function for use outside React components (with explicit language)
export function t<T extends Section>(section: T, lang: Language = 'es') {
  return translations[lang][section] as any;
}
