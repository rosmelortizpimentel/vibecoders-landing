import { useState, useEffect } from 'react';
import { Lock, Bug, Map, Activity, Megaphone, FileText, Vote, HelpCircle, Star, Users, Compass, Mail, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { registerToWaitlist } from '@/lib/waitlist';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import vibeLogo from '@/assets/vibecoders-logo.png';

const LAUNCH_DATE = new Date('2026-03-01T00:00:00').getTime();

const WIDGET_ICONS = [
  { key: 'feedback', icon: Bug, emoji: '🐛' },
  { key: 'roadmap', icon: Map, emoji: '🗺️' },
  { key: 'status', icon: Activity, emoji: '🟢' },
  { key: 'announcements', icon: Megaphone, emoji: '📢' },
  { key: 'changelog', icon: FileText, emoji: '📝' },
  { key: 'voting', icon: Vote, emoji: '🗳️' },
  { key: 'help', icon: HelpCircle, emoji: '💬' },
  { key: 'social', icon: Star, emoji: '⭐' },
  { key: 'community', icon: Users, emoji: '👥' },
  { key: 'onboarding', icon: Compass, emoji: '🎯' },
] as const;

const COMPARISON_ITEMS = [
  { key: 'feedback', icon: '🐛' },
  { key: 'roadmap', icon: '🗺️' },
  { key: 'status', icon: '🟢' },
  { key: 'announcements', icon: '📢' },
  { key: 'changelog', icon: '📝' },
  { key: 'help', icon: '💬' },
  { key: 'voting', icon: '🗳️' },
  { key: 'onboarding', icon: '🎯' },
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
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const result = await registerToWaitlist(email);
    if (result.success) {
      setStatus(result.alreadyExists ? 'already' : 'success');
    } else {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <img src={vibeLogo} alt="Vibecoders" className="h-8" />
        <LanguageSwitcher />
      </header>

      {/* Hero */}
      <section className="text-center px-6 pt-12 pb-16 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-400 mb-6">
          <Lock className="h-3.5 w-3.5" />
          {t('hero.badge')}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          {t('hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-10">
          {t('hero.subtitle')}
        </p>

        {/* Countdown */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-3">{t('hero.launchLabel')}</p>
          <div className="flex justify-center gap-4">
            {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
              <div key={unit} className="flex flex-col items-center">
                <span className="text-3xl md:text-5xl font-mono font-bold tabular-nums bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[72px]">
                  {String(countdown[unit]).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/40 mt-1.5">{t(`countdown.${unit}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suite Grid */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{t('suite.title')}</h2>
        <p className="text-white/50 text-center mb-10 text-sm md:text-base">{t('suite.subtitle')}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {WIDGET_ICONS.map(({ key, emoji }) => (
            <div
              key={key}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
            >
              <span className="text-2xl mb-2 block">{emoji}</span>
              <h3 className="font-semibold text-sm mb-1">{t(`suite.widgets.${key}.name`)}</h3>
              <p className="text-[11px] leading-relaxed text-white/40">{t(`suite.widgets.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('comparison.title')}</h2>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          {COMPARISON_ITEMS.map(({ key, icon }, i) => (
            <div
              key={key}
              className={`flex items-center justify-between px-5 py-3 text-sm ${i !== COMPARISON_ITEMS.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span>{icon}</span>
                <span className="text-white/70">{t(`comparison.tools.${key}`)}</span>
              </span>
              <span className="text-emerald-400 font-semibold text-xs">{t('comparison.included')} ✓</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 bg-emerald-500/10 border-t border-emerald-500/20">
            <span className="font-bold">{t('comparison.totalSavings')}</span>
            <span className="text-emerald-400 font-bold text-lg">$500-900{t('comparison.perMonth')}</span>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="px-6 pb-24 max-w-md mx-auto text-center">
        {status === 'success' || status === 'already' ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8">
            <Check className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-1">
              {status === 'already' ? t('alreadyRegistered.title') : t('success.title')}
            </h3>
            <p className="text-white/60 text-sm">
              {status === 'already' ? t('alreadyRegistered.subtitle') : t('success.subtitle')}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">{t('waitlist.title')}</h2>
            <p className="text-white/50 text-sm mb-6">{t('waitlist.subtitle')}</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="email"
                required
                placeholder={t('waitlist.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 flex-1"
              />
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 shrink-0"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Mail className="h-4 w-4 mr-1.5" />{t('waitlist.button')}</>
                )}
              </Button>
            </form>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Vibecoders. All rights reserved.
      </footer>
    </div>
  );
}
