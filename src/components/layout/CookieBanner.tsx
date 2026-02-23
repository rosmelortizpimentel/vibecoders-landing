import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, ChevronDown, ChevronUp, Shield, Globe, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'vibecoders_cookie_consent';

interface ConsentState {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: number;
}

export function CookieBanner() {
  const { t } = useTranslation('common');
  const { language } = useLanguage();
  const { profile } = useProfile();
  const { updateProfile } = useProfileEditor();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    essential: true,
    functional: true,
    analytics: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      setIsVisible(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
      } catch (e) {
        setIsVisible(true);
      }
    }
  }, []);

  const saveConsent = (state: ConsentState) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
    
    // Sync with profile if logged in
    if (profile) {
      updateProfile({
        allow_analytics: state.analytics,
      });
    }
    
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const newState = {
      essential: true,
      functional: true,
      analytics: true,
      timestamp: Date.now(),
    };
    setPreferences(newState);
    saveConsent(newState);
  };

  const handleEssentialOnly = () => {
    const newState = {
      essential: true,
      functional: false,
      analytics: false,
      timestamp: Date.now(),
    };
    setPreferences(newState);
    saveConsent(newState);
  };

  const handleSavePreferences = () => {
    saveConsent({
      ...preferences,
      timestamp: Date.now(),
    });
  };

  if (!isVisible) return null;

  const descriptionParts = t('cookies.banner.description').split('<link>');
  const privacyPolicyLabel = descriptionParts[1]?.replace('</link>', '') || '';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none">
      <div className={cn(
        "max-w-4xl mx-auto bg-white border border-slate-200 shadow-2xl rounded-[24px] md:rounded-[32px] pointer-events-auto transition-all duration-500 overflow-hidden",
        isExpanded ? "max-h-[1000px]" : "max-h-none md:max-h-[200px]"
      )}>
        <div className="p-5 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            {/* Icon & Title */}
            <div className="flex items-start gap-4 flex-1">
              <div className="shrink-0 w-12 h-12 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                <Cookie className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                  {t('cookies.banner.title')}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl font-medium">
                  {descriptionParts[0]}
                  <Link to="/privacy" className="text-indigo-600 hover:underline font-semibold ml-1">
                    {privacyPolicyLabel}
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1 lg:flex-none h-11 rounded-2xl text-[12px] font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all px-5"
              >
                <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="truncate">{t('cookies.buttons.manage')}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 ml-1.5" /> : <ChevronDown className="w-4 h-4 ml-1.5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEssentialOnly}
                className="flex-1 lg:flex-none h-11 rounded-2xl text-[12px] font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all px-5"
              >
                <span className="truncate">{t('cookies.buttons.essentialOnly')}</span>
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto lg:flex-none h-11 rounded-2xl text-[12px] font-black bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] px-8"
              >
                <span className="truncate">{t('cookies.buttons.acceptAll')}</span>
              </Button>
            </div>
          </div>

          {/* Expanded Preferences */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Essential */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-500" />
                      <Label className="text-[13px] font-bold text-slate-900">{t('cookies.categories.essential.title')}</Label>
                    </div>
                    <Switch checked disabled className="data-[state=checked]:bg-[#3D5AFE] scale-75" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t('cookies.categories.essential.description')}
                  </p>
                </div>

                {/* Functional */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      <Label className="text-[13px] font-bold text-slate-900">{t('cookies.categories.functional.title')}</Label>
                    </div>
                    <Switch 
                      checked={preferences.functional}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, functional: checked }))}
                      className="data-[state=checked]:bg-[#3D5AFE] scale-75" 
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t('cookies.categories.functional.description')}
                  </p>
                </div>

                {/* Analytics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      <Label className="text-[13px] font-bold text-slate-900">{t('cookies.categories.analytics.title')}</Label>
                    </div>
                    <Switch 
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                      className="data-[state=checked]:bg-[#3D5AFE] scale-75" 
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {t('cookies.categories.analytics.description')}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSavePreferences}
                  className="h-10 rounded-xl px-8 text-[12px] font-bold bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {t('cookies.buttons.save')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
