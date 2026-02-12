import { useState, useEffect } from 'react';
import { Lock, Bug, Map, Activity, Megaphone, FileText, Vote, HelpCircle, Star, Users, Compass, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { registerToWaitlist } from '@/lib/waitlist';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';
import vibeLogo from '@/assets/vibecoders-logo-dark.png';

const LAUNCH_DATE = new Date('2026-03-01T00:00:00').getTime();

const WIDGET_ICONS = [
  { key: 'feedback', icon: Bug },
  { key: 'roadmap', icon: Map },
  { key: 'status', icon: Activity },
  { key: 'announcements', icon: Megaphone },
  { key: 'changelog', icon: FileText },
  { key: 'voting', icon: Vote },
  { key: 'help', icon: HelpCircle },
  { key: 'social', icon: Star },
  { key: 'community', icon: Users },
  { key: 'onboarding', icon: Compass },
] as const;

const COMPARISON_ITEMS = [
  { key: 'feedback', icon: Bug },
  { key: 'roadmap', icon: Map },
  { key: 'status', icon: Activity },
  { key: 'announcements', icon: Megaphone },
  { key: 'changelog', icon: FileText },
  { key: 'help', icon: HelpCircle },
  { key: 'voting', icon: Vote },
  { key: 'onboarding', icon: Compass },
] as const;

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, LAUNCH_DATE - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export default function Closed() {
  const { t } = useTranslation('closed');
  const countdown = useCountdown();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already'>('idle');

  const handleJoinWaitlist = async () => {
    setStatus('loading');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (!email) {
        setStatus('idle');
        return;
      }
      const result = await registerToWaitlist(email);
      if (result.success) {
        setStatus(result.alreadyExists ? 'already' : 'success');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#000519] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-6">
        <img src={vibeLogo} alt="Vibecoders" className="h-16 w-16 rounded-full" />
      </header>

      {/* Hero */}
      <section className="text-center px-4 sm:px-6 pt-8 pb-12 max-w-3xl mx-auto w-full">
        <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary mb-6">
          <Lock className="h-3.5 w-3.5" />
          {t('hero.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10">
          {t('hero.subtitle')}
        </p>

        {/* Countdown */}
        <div className="mb-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/30 mb-3">{t('hero.launchLabel')}</p>
          <div className="flex justify-center gap-2 sm:gap-4">
            {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
              <div key={unit} className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold tabular-nums bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[56px] sm:min-w-[72px]">
                  {String(countdown[unit]).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/30 mt-1.5">{t(`countdown.${unit}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suite Grid */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20 max-w-6xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2">{t('suite.title')}</h2>
        <p className="text-white/40 text-center mb-8 sm:mb-10 text-xs sm:text-sm md:text-base">{t('suite.subtitle')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {WIDGET_ICONS.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4 hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-300"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm mb-1">{t(`suite.widgets.${key}.name`)}</h3>
              <p className="text-[10px] sm:text-[11px] leading-relaxed text-white/35">{t(`suite.widgets.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20 max-w-3xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8">{t('comparison.title')}</h2>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {COMPARISON_ITEMS.map(({ key, icon: Icon }, i) => (
            <div
              key={key}
              className={`flex items-center justify-between px-4 sm:px-5 py-3 text-xs sm:text-sm ${i !== COMPARISON_ITEMS.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Icon className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                <div className="min-w-0">
                  <span className="text-white/70 block truncate">{t(`comparison.tools.${key}.name`)}</span>
                  <span className="text-[10px] text-white/30 block truncate">{t(`comparison.tools.${key}.purpose`)}</span>
                </div>
              </div>
              <span className="text-primary font-semibold text-[10px] sm:text-xs shrink-0 ml-2">{t('comparison.included')}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 bg-secondary/[0.06] border-t border-secondary/20">
            <span className="font-bold text-sm sm:text-base">{t('comparison.totalSavings')}</span>
            <span className="text-secondary font-bold text-base sm:text-lg">$500-900{t('comparison.perMonth')}</span>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="px-4 sm:px-6 pb-20 sm:pb-24 max-w-md mx-auto text-center w-full">
        {status === 'success' || status === 'already' ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8">
            <Check className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg sm:text-xl font-bold mb-1">
              {status === 'already' ? t('alreadyRegistered.title') : t('success.title')}
            </h3>
            <p className="text-white/50 text-xs sm:text-sm">
              {status === 'already' ? t('alreadyRegistered.subtitle') : t('success.subtitle')}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('waitlist.title')}</h2>
            <p className="text-white/40 text-xs sm:text-sm mb-6">{t('waitlist.subtitle')}</p>
            <Button
              onClick={handleJoinWaitlist}
              disabled={status === 'loading'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 text-sm sm:text-base rounded-full"
            >
              {status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('waitlist.button')}
            </Button>
          </>
        )}
      </section>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
