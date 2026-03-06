import { useCallback, useMemo } from 'react';
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
import feedbackEs from '@/i18n/es/feedback.json';
import betaEs from '@/i18n/es/beta.json';
import notificationsEs from '@/i18n/es/notifications.json';
import vibersEs from '@/i18n/es/vibers.json';
import promptsEs from '@/i18n/es/prompts.json';
import newLandingEs from '@/i18n/es/newLanding.json';
import proEs from '@/i18n/es/pro.json';
import surveyEs from '@/i18n/es/survey.json';
import roadmapEs from '@/i18n/es/roadmap.json';
import partnershipsEs from '@/i18n/es/partnerships.json';


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
import feedbackEn from '@/i18n/en/feedback.json';
import betaEn from '@/i18n/en/beta.json';
import notificationsEn from '@/i18n/en/notifications.json';
import vibersEn from '@/i18n/en/vibers.json';
import promptsEn from '@/i18n/en/prompts.json';
import newLandingEn from '@/i18n/en/newLanding.json';
import proEn from '@/i18n/en/pro.json';
import surveyEn from '@/i18n/en/survey.json';
import roadmapEn from '@/i18n/en/roadmap.json';
import partnershipsEn from '@/i18n/en/partnerships.json';


// French imports
import commonFr from '@/i18n/fr/common.json';
import heroFr from '@/i18n/fr/hero.json';
import featuresFr from '@/i18n/fr/features.json';
import waitlistFr from '@/i18n/fr/waitlist.json';
import legalFr from '@/i18n/fr/legal.json';
import authFr from '@/i18n/fr/auth.json';
import profileFr from '@/i18n/fr/profile.json';
import appsFr from '@/i18n/fr/apps.json';
import brandingFr from '@/i18n/fr/branding.json';
import homeFr from '@/i18n/fr/home.json';
import projectsFr from '@/i18n/fr/projects.json';
import toolsFr from '@/i18n/fr/tools.json';
import buildlogFr from '@/i18n/fr/buildlog.json';
import publicProfileFr from '@/i18n/fr/publicProfile.json';
import followersFr from '@/i18n/fr/followers.json';
import onboardingFr from '@/i18n/fr/onboarding.json';
import errorsFr from '@/i18n/fr/errors.json';
import adminFr from '@/i18n/fr/admin.json';
import feedbackFr from '@/i18n/fr/feedback.json';
import betaFr from '@/i18n/fr/beta.json';
import notificationsFr from '@/i18n/fr/notifications.json';
import vibersFr from '@/i18n/fr/vibers.json';
import promptsFr from '@/i18n/fr/prompts.json';
import newLandingFr from '@/i18n/fr/newLanding.json';
import proFr from '@/i18n/fr/pro.json';
import surveyFr from '@/i18n/fr/survey.json';
import roadmapFr from '@/i18n/fr/roadmap.json';
import partnershipsFr from '@/i18n/fr/partnerships.json';


// Portuguese imports
import commonPt from '@/i18n/pt/common.json';
import heroPt from '@/i18n/pt/hero.json';
import featuresPt from '@/i18n/pt/features.json';
import waitlistPt from '@/i18n/pt/waitlist.json';
import legalPt from '@/i18n/pt/legal.json';
import authPt from '@/i18n/pt/auth.json';
import profilePt from '@/i18n/pt/profile.json';
import appsPt from '@/i18n/pt/apps.json';
import brandingPt from '@/i18n/pt/branding.json';
import homePt from '@/i18n/pt/home.json';
import projectsPt from '@/i18n/pt/projects.json';
import toolsPt from '@/i18n/pt/tools.json';
import buildlogPt from '@/i18n/pt/buildlog.json';
import publicProfilePt from '@/i18n/pt/publicProfile.json';
import followersPt from '@/i18n/pt/followers.json';
import onboardingPt from '@/i18n/pt/onboarding.json';
import errorsPt from '@/i18n/pt/errors.json';
import adminPt from '@/i18n/pt/admin.json';
import feedbackPt from '@/i18n/pt/feedback.json';
import betaPt from '@/i18n/pt/beta.json';
import notificationsPt from '@/i18n/pt/notifications.json';
import vibersPt from '@/i18n/pt/vibers.json';
import promptsPt from '@/i18n/pt/prompts.json';
import newLandingPt from '@/i18n/pt/newLanding.json';
import proPt from '@/i18n/pt/pro.json';
import surveyPt from '@/i18n/pt/survey.json';
import roadmapPt from '@/i18n/pt/roadmap.json';
import partnershipsPt from '@/i18n/pt/partnerships.json';


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
    feedback: feedbackEs,
    beta: betaEs,
    notifications: notificationsEs,
    vibers: vibersEs,
    prompts: promptsEs,
    newLanding: newLandingEs,
    pro: proEs,
    survey: surveyEs,
    roadmap: roadmapEs,
    partnerships: partnershipsEs,
    
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
    feedback: feedbackEn,
    beta: betaEn,
    notifications: notificationsEn,
    vibers: vibersEn,
    prompts: promptsEn,
    newLanding: newLandingEn,
    pro: proEn,
    survey: surveyEn,
    roadmap: roadmapEn,
    partnerships: partnershipsEn,
    
  },
  fr: {
    common: commonFr,
    hero: heroFr,
    features: featuresFr,
    waitlist: waitlistFr,
    legal: legalFr,
    auth: authFr,
    profile: profileFr,
    apps: appsFr,
    branding: brandingFr,
    home: homeFr,
    projects: projectsFr,
    tools: toolsFr,
    buildlog: buildlogFr,
    publicProfile: publicProfileFr,
    followers: followersFr,
    onboarding: onboardingFr,
    errors: errorsFr,
    admin: adminFr,
    feedback: feedbackFr,
    beta: betaFr,
    notifications: notificationsFr,
    vibers: vibersFr,
    prompts: promptsFr,
    newLanding: newLandingFr,
    pro: proFr,
    survey: surveyFr,
    roadmap: roadmapFr,
    partnerships: partnershipsFr,
    
  },
  pt: {
    common: commonPt,
    hero: heroPt,
    features: featuresPt,
    waitlist: waitlistPt,
    legal: legalPt,
    auth: authPt,
    profile: profilePt,
    apps: appsPt,
    branding: brandingPt,
    home: homePt,
    projects: projectsPt,
    tools: toolsPt,
    buildlog: buildlogPt,
    publicProfile: publicProfilePt,
    followers: followersPt,
    onboarding: onboardingPt,
    errors: errorsPt,
    admin: adminPt,
    feedback: feedbackPt,
    beta: betaPt,
    notifications: notificationsPt,
    vibers: vibersPt,
    prompts: promptsPt,
    newLanding: newLandingPt,
    pro: proPt,
    survey: surveyPt,
    roadmap: roadmapPt,
    partnerships: partnershipsPt,
    
  },
} as const;

type Section = keyof typeof translations['es'];

export function useTranslation<T extends Section>(section: T): { t: (key: string, data?: Record<string, string | number>) => string } & typeof translations['es'][T] {
  const { language } = useLanguage();
  const sectionTranslations = translations[language][section];
  
  // Return a t function that gets nested keys and supports interpolation
  // Memoize it to prevent infinite loops in downstream components like DomainSettingsInput
  const t = useCallback((key: string, data?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: unknown = sectionTranslations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        // Handle defaultValue if provided
        if (data?.defaultValue) {
          let defaultValue = String(data.defaultValue);
          // Still process interpolation even if using default value
          Object.entries(data).forEach(([dk, dv]) => {
            if (dk !== 'defaultValue') {
              defaultValue = defaultValue.replace(`{{${dk}}}`, String(dv));
            }
          });
          return defaultValue;
        }

        // Fallback to English if not foundational or current language is not English
        if (language !== 'en') {
          const englishTranslations = translations['en'][section];
          let englishResult: unknown = englishTranslations;
          for (const ek of keys) {
            if (englishResult && typeof englishResult === 'object' && ek in englishResult) {
              englishResult = (englishResult as Record<string, unknown>)[ek];
            } else {
              return key;
            }
          }
          let finalEnglishResult = typeof englishResult === 'string' ? englishResult : key;
          if (data) {
            Object.entries(data).forEach(([k, v]) => {
              if (k !== 'defaultValue') {
                finalEnglishResult = finalEnglishResult.replace(`{{${k}}}`, String(v));
              }
            });
          }
          return finalEnglishResult;
        }
        return key; // Return key if not found
      }
    }
    let finalResult = typeof result === 'string' ? result : key;
    
    if (data) {
      Object.entries(data).forEach(([k, v]) => {
        if (k !== 'defaultValue') {
          finalResult = finalResult.replace(`{{${k}}}`, String(v));
        }
      });
    }
    
    return finalResult;
  }, [language, sectionTranslations, section]); // Stability depends on language, section data, and section name
  
  // Memoize the return object as well to maintain referential integrity
  return useMemo(() => ({ 
    t, 
    ...(sectionTranslations as object)
  } as { t: (key: string, data?: Record<string, string | number>) => string } & typeof translations['es'][T]), [t, sectionTranslations]);
}

// Static function for use outside React components (with explicit language)
export function t<T extends Section>(section: T, lang: Language = 'es') {
  return translations[lang][section] as typeof translations['es'][T];
}
