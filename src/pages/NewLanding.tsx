import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  AlertTriangle,
  Linkedin,
  Heart,
  Lock,
  Unlock,
  Copy,
  Users,
  Briefcase,
  Calendar,
  Star,
  BookOpen,
  ChevronRight,
  Gem,
  Zap,
  ShieldCheck,
  Medal,
  Trophy,
  Check,
  X,
  Clock,
  Map,
  MessageSquare,
  Megaphone,
  Phone,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import FoundersMarquee from '@/components/home/FoundersMarquee';
import AppsShowcase from '@/components/home/AppsShowcase';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import canadaFlag from '@/assets/canada-flag.png';
import sheepAvatar from '@/assets/sheep-avatar.jpg';
import sheepCoolAvatar from '@/assets/sheep-cool.png';
import userSittingAvatar from '@/assets/user-photo.jpg';

// Tool Logos for Resource Vault
import cursorLogo from '@/assets/logos/cursor.jpg';
import windsurfLogo from '@/assets/logos/windsurf.svg';
import v0Logo from '@/assets/logos/v0.png';
import replitLogo from '@/assets/logos/replit.svg';
import boltLogo from '@/assets/logos/bolt.png';
import lovableLogo from '@/assets/logos/lovable-icon.png';
import { getLandingStats } from '@/utils/landingStats';

/* ─── Wave Divider ─── */
const NewWaveDivider = ({
  fromColor = '#3B82F6',
  toColor = '#ffffff',
  className = '',
  size = 'md' as 'sm' | 'md' | 'lg',
}) => {
  const sizeClasses = {
    sm: 'h-[30px] sm:h-[40px] md:h-[50px]',
    md: 'h-[60px] sm:h-[80px] md:h-[100px]',
    lg: 'h-[80px] sm:h-[100px] md:h-[120px]',
  };
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ backgroundColor: fromColor }}>
      <svg
        className={`relative block w-full ${sizeClasses[size]}`}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,0 C300,100 900,20 1200,80 L1200,120 L0,120 Z" fill={toColor} />
      </svg>
    </div>
  );
};

/* ─── Hero Section ─── */
const NewHeroSection = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const { t } = useTranslation('newLanding');
  const { t: tAuth } = useTranslation('auth');
  const { language } = useLanguage();
  // Initialize with null to hide by default until data loads
  const [stats, setStats] = useState<{ totalBuilders: number; totalApps: number; spotsLeft: number } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const liveStats = await getLandingStats();
      if (liveStats) {
        setStats(liveStats);
      }
    };
    fetchStats();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(`${window.location.origin}/me`);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      await signInWithLinkedIn(`${window.location.origin}/me`);
    } catch (error) {
      console.error('Error signing in with LinkedIn:', error);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-8 md:pt-16 overflow-hidden bg-[#3D5AFE]">
      {/* Language Switcher */}
      <div className="absolute sm:fixed right-4 top-4 z-50 flex items-center gap-2">
        <LanguageSwitcher variant="header" />
      </div>

      {/* Subtle top gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-48 md:h-64"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Logo */}
        <div
          className="mb-10 animate-fade-in opacity-0 flex justify-center"
          style={{ animationDelay: '0.05s' }}
        >
          <img
            src={vibecodersLogo}
            alt="Vibecoders"
            className="h-16 w-16 md:h-20 md:w-20 rounded-full border-[3px] border-white object-cover shadow-lg"
          />
        </div>

        {/* Badge */}
        <p
          className="mb-6 animate-fade-in text-sm font-medium uppercase tracking-[0.2em] text-white/70 opacity-0"
          style={{ animationDelay: '0.1s' }}
        >
          {t('hero.badge')}
        </p>

        {/* Headline */}
        <h1
          className="mb-6 animate-fade-in text-4xl font-bold leading-[1.1] tracking-tight text-white opacity-0 sm:text-5xl lg:text-6xl"
          style={{ animationDelay: '0.2s' }}
        >
          {t('hero.headline1')}
          <br />
          {t('hero.headline2')}
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto mb-10 max-w-2xl animate-fade-in text-base text-white/80 opacity-0 leading-relaxed sm:text-lg"
          style={{ animationDelay: '0.3s' }}
        >
          {t('hero.subheadline')}
        </p>

        {/* Auth or Profile */}
        {user ? (
          <div
            className="mx-auto mb-8 flex max-w-md animate-fade-in flex-col items-center gap-4 opacity-0"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-lg text-white/90">
              {t('hero.greeting', { name: user.user_metadata?.full_name?.split(' ')[0] || 'Vibecoder' })}
            </p>
            <Button
              onClick={() => navigate('/me')}
              className="h-12 gap-2 px-6 font-semibold bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/80"
            >
              {t('hero.goToProfile')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="mx-auto mb-6 flex w-full max-w-xl animate-fade-in flex-col items-center gap-4 opacity-0 px-2 sm:px-0"
            style={{ animationDelay: '0.4s' }}
          >
            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row w-full gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-6 text-base font-semibold text-gray-800 ring-1 ring-black/5 transition-all duration-200 hover:ring-black/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98]"
                style={{ minHeight: '64px', boxShadow: '0 4px 14px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-8.01 2.5-9.72 6.13l3.76 2.91c.83-2.52 3.19-4.32 5.96-4.32z"/>
                </svg>
                {t('hero.continueGoogle')}
              </button>

              <button
                onClick={handleLinkedInSignIn}
                className="group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 text-base font-semibold text-white ring-1 ring-white/20 transition-all duration-200 hover:ring-white/40 hover:shadow-[0_8px_30px_rgba(0,119,181,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                style={{ minHeight: '64px', background: 'linear-gradient(135deg, #0077B5 0%, #005582 100%)', boxShadow: '0 4px 14px rgba(0,119,181,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                <Linkedin className="h-5 w-5 fill-white" />
                {t('hero.continueLinkedIn')}
              </button>
            </div>
            
            {/* Legal Disclaimer */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="text-xs text-white/60 text-center px-4 leading-tight">
                {tAuth('legalDisclaimer')}{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
                  {tAuth('termsOfService')}
                </a>,{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
                  {tAuth('privacyPolicy')}
                </a>{' '}
                {language === 'en' ? 'and' : language === 'pt' ? 'e' : 'y'}{' '}
                <a href="/cookies" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">
                  {tAuth('cookiePolicy')}
                </a>.
              </div>
            </div>
          </div>
        )}

        {/* Social Proof - Only shown if stats load and spots remain */}
        {stats && stats.spotsLeft > 0 && (
          <p
            className="animate-fade-in text-xs md:text-sm text-white/50 opacity-0 tracking-wide font-medium"
            style={{ animationDelay: '0.55s' }}
          >
            {t('hero.socialProof', { 
              countApps: stats.totalApps, 
              countBuilders: stats.totalBuilders, 
              countSpots: stats.spotsLeft 
            })}
          </p>
        )}
      </div>
    </section>
  );
};

/* ─── Full Ecosystem Bento Grid (6 Cards) ─── */
const FeatureGrid = () => {
  const { t } = useTranslation('newLanding');

  // Helper to render text between single quotes as badges
  const renderBodyWithBadges = (text: string) => {
    const parts = text.split(/('[^']+')/);
    return parts.map((part, i) => {
      if (part.startsWith("'") && part.endsWith("'")) {
        const inner = part.slice(1, -1);
        let colorClass = "bg-stone-50 text-stone-600 border-stone-200";
        if (inner.toLowerCase().includes("tester")) {
          colorClass = "bg-stone-50 text-stone-600 border-stone-200";
        } else if (inner.toLowerCase().includes("verificada") || inner.toLowerCase().includes("verified")) {
          colorClass = "bg-stone-50 text-stone-600 border-stone-200";
        }
        return (
          <span key={i} className={`inline-flex items-center mx-1 px-1.5 py-0.5 rounded-md border text-[12px] font-bold tracking-tight whitespace-nowrap ${colorClass} transition-transform duration-300 hover:scale-105`}>
            {inner}
          </span>
        );      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <section className="relative bg-white py-20 px-4 md:py-28 overflow-hidden">
      {/* Modern Dot Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-400 mb-4">
            {t('grid.sectionTag')}
          </p>
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            {t('grid.sectionTitle')}
          </h2>
        </div>

        {/* Asymmetric Bento Grid: 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-auto">

          {/* ── Card 1: Identity & Business ── col-span-2 */}
          <div className="md:col-span-2 group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col">
            {/* Browser mockup */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-500 font-mono">
                  vibecoders.la/@rosmelortiz
                </div>
              </div>
              {/* Profile preview */}
              <div className="p-4 md:p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                    <img src={sheepAvatar} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-900 text-sm">Rosmel Ortiz</span>
                      <Gem className="h-3 w-3 text-[#3D5AFE]" />
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 px-2 py-0.5 text-[10px] font-semibold text-[#3D5AFE] uppercase tracking-wide">{t('grid.card1.openToWork')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-1">
                      <span className="flex items-center gap-1"><span className="font-bold text-stone-900">84</span> {t('grid.card1.following')}</span>
                      <span className="flex items-center gap-1"><span className="font-bold text-stone-900">45</span> {t('grid.card1.followers')}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-400 lowercase">@rosmelortiz</span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 rounded-lg bg-[#1c1c1c] px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1.5 hover:bg-[#333] transition-colors">
                    <Calendar className="h-3 w-3" />
                    {t('grid.card1.hireMe')}
                  </button>
                </div>
                {/* Moving tagline here for full width on mobile */}
                <p className="text-[11px] md:text-xs text-stone-500 mt-1 italic font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis pl-14 sm:pl-16">
                  {t('grid.card1.subtitle')}
                </p>
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-stone-900">
              {t('grid.card1.title')}
            </h3>
            <p className="text-stone-500 leading-relaxed text-[15px]">
              {t('grid.card1.body')}
            </p>
          </div>

          {/* ── Card 2: Squads ── row-span-2, tall */}
          <div className="md:row-span-2 group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col">
            <h3 className="mb-2 text-xl font-bold text-stone-900">
              {t('grid.card2.title')}
            </h3>
            <p className="text-stone-500 leading-relaxed text-[15px] mb-5">
              {t('grid.card2.body')}
            </p>
            {/* Tester list mockup */}
            <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-stone-900" />
                  {t('grid.card2.activeTesters')}
                </span>
                <span className="text-[10px] font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">{t('grid.card2.online')}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { name: 'Ana M.', status: 'Testing v2.1', color: 'bg-stone-900' },
                  { name: 'Carlos R.', status: 'Bug reported', color: 'bg-stone-400' },
                  { name: 'Sofia T.', status: 'Approved', color: 'bg-stone-900' },
                  { name: 'Diego L.', status: 'Reviewing UX', color: 'bg-stone-600' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`h-7 w-7 rounded-full ${t.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm`}>
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-800 truncate">{t.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 p-3">
                <button className="w-full rounded-lg bg-stone-900 py-2 text-xs font-semibold text-white flex items-center justify-center gap-1.5 hover:bg-stone-800 transition-colors shadow-sm">
                  <Users className="h-3.5 w-3.5" />
                  {t('grid.card2.joinSquad')}
                </button>
              </div>
            </div>
          </div>

          {/* ── Card 3: Roadmap & Ideas ── md:col-span-2 */}
          <div className="md:col-span-2 group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Mini Kanban mockup */}
            <div className="flex-1 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <img src={vibecodersLogo} alt="Logo" className="h-5 w-5 rounded-md" />
                <span className="text-xs font-semibold text-stone-700">{t('grid.card3.roadmap')}</span>
              </div>
              <div className="overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
                <div className="grid grid-cols-3 gap-px bg-gray-100 text-[10px] min-w-[300px]">
                  {/* TO DO Column */}
                  <div className="bg-white p-2.5 space-y-1.5">
                    <span className="font-semibold text-stone-400 uppercase tracking-wider block mb-2">{t('grid.card3.todo')}</span>
                    <div className="rounded bg-stone-50 border border-stone-100 px-2 py-1.5 text-stone-500">Auth v2</div>
                    <div className="rounded bg-stone-50 border border-stone-100 px-2 py-1.5 text-stone-500">Dark mode</div>
                  </div>
                  {/* IN PROGRESS Column */}
                  <div className="bg-white p-2.5 space-y-1.5">
                    <span className="font-semibold text-stone-500 uppercase tracking-wider block mb-2">{t('grid.card3.inProgress')}</span>
                    <div className="rounded bg-stone-50 border border-stone-200 px-2 py-1.5 text-stone-600">API v3</div>
                  </div>
                  {/* DONE Column */}
                  <div className="bg-white p-2.5 space-y-1.5">
                    <span className="font-semibold text-stone-500 uppercase tracking-wider block mb-2">{t('grid.card3.done')}</span>
                    <div className="rounded bg-stone-50 border border-stone-200 px-2 py-1.5 text-stone-600 line-through opacity-70 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      Landing
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sticky Notes Area - Ideas */}
              <div className="mt-3 flex items-start gap-3 px-1">
                <div className="bg-yellow-50/80 border border-yellow-100/50 rounded-sm p-2 shadow-sm transform -rotate-1 max-w-[80px]">
                   <p className="text-[9px] leading-tight text-yellow-800/80 font-medium">Idea 1</p>
                </div>
                <div className="bg-yellow-50/80 border border-yellow-100/50 rounded-sm p-2 shadow-sm transform rotate-2 max-w-[80px] mt-1">
                   <p className="text-[9px] leading-tight text-yellow-800/80 font-medium">Idea 2</p>
                </div>
              </div>
            </div>
            {/* Text description */}
            <div className="md:w-1/3 flex flex-col justify-center">
              <h3 className="mb-2 text-xl font-bold text-stone-900">
                {t('grid.card3.title')}
              </h3>
              <p className="text-stone-500 leading-relaxed text-[15px]">
                {t('grid.card3.body')}
              </p>
            </div>
          </div>

          {/* ── Card 4: Resource Vault ── 1 col */}
          <div className="group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col">
            {/* Micro-logo grid visual */}
            <div className="mb-7 h-44 rounded-xl border border-gray-100 bg-stone-50/30 p-4 flex items-center justify-center relative overflow-hidden group">
              {/* Decorative background pulse */}
              <div className="absolute inset-0 bg-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl rounded-full scale-50" />
              
              <div className="grid grid-cols-3 gap-3 relative z-10 w-full max-w-[240px]">
                {[
                  { src: cursorLogo, alt: 'Cursor' },
                  { src: windsurfLogo, alt: 'Windsurf' },
                  { src: v0Logo, alt: 'v0' },
                  { src: replitLogo, alt: 'Replit' },
                  { src: boltLogo, alt: 'Bolt' },
                  { src: lovableLogo, alt: 'Lovable' },
                ].map((logo, idx) => (
                  <div 
                    key={idx}
                    className="aspect-square rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-center group/logo"
                  >
                    <img 
                      src={logo.src} 
                      alt={logo.alt} 
                      className="h-full w-full object-contain filter grayscale group-hover/logo:grayscale-0 transition-all duration-500" 
                    />
                  </div>
                ))}
              </div>
            </div>            <h3 className="mb-2 text-xl font-bold text-stone-900">
              {t('grid.card4.title')}
            </h3>
            <p className="text-stone-500 leading-relaxed text-[15px]">
              {t('grid.card4.body')}
            </p>
          </div>

          {/* ── Card 5: Blog ── 1 col */}
          <div className="group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col">
            {/* Article cards mockup */}
            <div className="mb-7 h-44 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
              <div className="border-b border-gray-100 px-4 py-2.5 flex items-center gap-1.5 flex-shrink-0">
                <BookOpen className="h-3.5 w-3.5 text-stone-400" />
                <span className="text-xs font-semibold text-stone-700">{t('grid.card5.blog')}</span>
              </div>
              <div className="flex-1 divide-y divide-gray-50 overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-stone-100">
                    <img src={userSittingAvatar} alt="User" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{t('grid.card5.article1')}</p>
                    <p className="text-[10px] text-stone-400">{t('grid.card5.article1Time')}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-300 flex-shrink-0" />
                </div>
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-stone-100">
                    <img src={sheepCoolAvatar} alt="Sheep Cool" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{t('grid.card5.article2')}</p>
                    <p className="text-[10px] text-stone-400">{t('grid.card5.article2Time')}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-stone-300 flex-shrink-0" />
                </div>
              </div>            </div>            <h3 className="mb-2 text-xl font-bold text-stone-900">
              {t('grid.card5.title')}
            </h3>
            <p className="text-stone-500 leading-relaxed text-[15px]">
              {t('grid.card5.body')}
            </p>
          </div>

          {/* ── Card 6: Gamification ── col-span-1 (Move to Row 3, Col 3) ── */}
          <div className="md:col-span-1 group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl flex flex-col">
            {/* Badge container - Trophy Case */}
            <div className="mb-7 h-auto md:h-44 w-full rounded-xl border border-gray-200 bg-stone-50/50 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden">
              {/* Badge 1: App Verificada */}
              <div className="flex-1 w-full flex flex-col items-center p-3 rounded-lg border border-stone-200 bg-stone-50 shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
                <div className="h-10 w-10 mb-2 rounded-full bg-white flex items-center justify-center border border-stone-200">
                  <ShieldCheck className="h-5 w-5 text-stone-900" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-stone-600 text-center leading-tight uppercase tracking-tight">
                  {t('grid.card6.appVerified')}
                </span>
              </div>

              {/* Badge 2: Tester Oficial */}
              <div className="flex-1 w-full flex flex-col items-center p-3 rounded-lg border border-stone-200 bg-white shadow-md transition-transform duration-500 sm:group-hover:-translate-y-2">
                <div className="h-10 w-10 mb-2 rounded-full bg-stone-50 flex items-center justify-center border border-stone-200 shadow-sm">
                  <Medal className="h-5 w-5 text-stone-900" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-stone-600 text-center leading-tight uppercase tracking-tight">
                  {t('grid.card6.officialTester')}
                </span>
              </div>

              {/* Badge 3: Top Builder */}
              <div className="flex-1 w-full flex flex-col items-center p-3 rounded-lg border border-stone-200 bg-white transition-transform duration-500 group-hover:-translate-y-1">
                <div className="h-10 w-10 mb-2 rounded-full bg-stone-50 flex items-center justify-center border border-stone-200">
                  <Trophy className="h-5 w-5 text-stone-900" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold text-stone-600 text-center leading-tight uppercase tracking-tight">
                  {t('grid.card6.topBuilder')}
                </span>
              </div>
            </div>
            {/* Text description - NOW ON BOTTOM */}
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-bold text-stone-900">
                {t('grid.card6.title')}
              </h3>
              <p className="text-stone-500 leading-relaxed text-[15px]">
                {renderBodyWithBadges(t('grid.card6.body'))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Closed Access Section (shown when spots run out) ─── */
const ClosedAccessSection = ({ totalBuilders, onLinkedInClick, onGoogleClick }: { totalBuilders: number; onLinkedInClick: (signupSource?: string) => void; onGoogleClick: (signupSource?: string) => void }) => {
  const { t } = useTranslation('newLanding');

  const [timeLeft, setTimeLeft] = useState(() => {
    const difference = +new Date("2026-02-28T23:59:59") - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = +new Date("2026-02-28T23:59:59") - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const avatarPhotos = [
    'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/e2df4196-aa86-465e-9a62-0d2508843b9e/avatar_1770449276650.jpeg',
    'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/b8256ba9-2633-4c0c-b14f-4d6ad3c770a9/avatar_migrated_1770716423332.png',
    'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/2a409748-c62a-4015-8d7a-f152ddcb1e0c/avatar_migrated_1770716415391.png',
    'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/deeaea5d-f7e9-4dc0-8852-b5ec81de42a1/avatar_migrated_1770716424592.png',
    'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/45335b21-6d8b-4369-afce-340d8e6adb99/avatar_1770308992103.png',
    'https://zkotnnmrehzqonlyeorv.supabase.co/storage/v1/object/public/profile-assets/7f969e81-1b47-420f-bb35-fb2e498c6068/avatar_migrated_1770716417376.jpeg',
  ];

  const freeFeatures = [
    { key: 'f1', included: true },
    { key: 'f2', included: true },
    { key: 'f3', included: true },
    { key: 'f4', included: false },
  ];

  const proFeatures = [
    { key: 'f1', included: true },
    { key: 'f2', included: true },
    { key: 'f3', included: true },
    { key: 'f4', included: true },
    { key: 'f5', included: true },
    { key: 'f6', included: true },
  ];

  const proFeatureIcons: Record<string, React.ReactNode> = {
    f1: <Check className="h-4 w-4 text-[#3D5AFE]" />,
    f2: <Map className="h-4 w-4 text-[#3D5AFE]" />,
    f3: <MessageSquare className="h-4 w-4 text-[#3D5AFE]" />,
    f4: <Megaphone className="h-4 w-4 text-[#3D5AFE]" />,
    f5: <Phone className="h-4 w-4 text-[#3D5AFE]" />,
    f6: <ShieldCheck className="h-4 w-4 text-[#3D5AFE]" />,
  };

  return (
    <section className="bg-white py-20 md:py-28 px-4 sm:px-6 border-t border-stone-100">
      <div className="mx-auto max-w-5xl">

        {/* Social Proof Banner */}
        <div className="rounded-3xl bg-[#000519] p-8 sm:p-10 md:p-14 text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-semibold text-white/50 uppercase tracking-[0.15em] mb-6">
            <Lock className="h-3 w-3" />
            {t('pricing.closed.badge')}
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-6 leading-tight">
            {t('pricing.closed.title')}
          </h2>

          {/* Avatar Stack */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <div className="flex -space-x-2.5">
              {avatarPhotos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-[#000519] shadow-lg"
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-white/40 font-medium">
              {t('pricing.closed.socialProofCaption')}
            </span>
          </div>

          <p className="text-sm sm:text-base text-white/35 max-w-lg mx-auto leading-relaxed">
            {t('pricing.closed.joinSubheadline')}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10 md:items-stretch">

          {/* Card A: Free */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6 sm:p-8 md:p-10 flex flex-col">
            <div className="mb-6 md:mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
                {t('pricing.plans.free.title')}
              </h3>
              <p className="text-sm text-stone-500 font-medium">
                {t('pricing.plans.free.desc')}
              </p>
            </div>

            <div className="mb-6 md:mb-10">
              <span className="text-5xl font-black tracking-tighter text-stone-900">$0</span>
              <span className="ml-2 text-stone-400 font-bold uppercase text-xs tracking-widest">
                {t('pricing.plans.free.priceLabel')}
              </span>
            </div>

            <ul className="mb-8 md:mb-12 space-y-4 text-left flex-grow">
              {freeFeatures.map(({ key, included }) => (
                <li key={key} className={`flex items-start gap-3 text-sm ${(!included && key !== 'f4') ? 'opacity-40' : ''}`}>
                  {key !== 'f4' && (
                    <div className="mt-0.5 shrink-0">
                      {included ? (
                        <Check className="h-4 w-4 text-stone-400" />
                      ) : (
                        <X className="h-4 w-4 text-stone-300" />
                      )}
                    </div>
                  )}
                  <div>
                    {key === 'f4' ? (
                      <span className="block mt-1 text-[13px] text-[#3D5AFE] font-bold text-left">
                        {t(`pricing.plans.free.${key}`)}
                      </span>
                    ) : (
                      <>
                        <span className={`font-medium ${included ? 'text-stone-600' : 'text-stone-400'}`}>
                          {t(`pricing.plans.free.${key}`)}
                        </span>
                        {key === 'f3' && included && (
                          <a
                            href="https://www.vibecoders.la/@rosmelortiz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-1 text-xs text-[#3D5AFE] hover:underline font-medium"
                          >
                            {t('pricing.plans.free.f3_example')} →
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Auth Buttons - Outline */}
            <div className="mt-auto flex flex-col gap-2.5">
              <button
                onClick={() => onLinkedInClick('free_card')}
                className="w-full h-12 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-all flex items-center justify-center gap-2.5"
              >
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                {t('pricing.plans.free.cta')}
              </button>
              <button
                onClick={() => onGoogleClick('free_card')}
                className="w-full h-12 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-medium text-sm transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('pricing.plans.free.ctaGoogle')}
              </button>
            </div>
          </div>

          {/* Card B: Pro Pre-sale */}
          <div className="relative rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 sm:p-8 md:p-10 flex flex-col">
            {/* Badge */}
            <div className="absolute -top-3.5 left-6 sm:left-10 rounded-md bg-[#3D5AFE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-sm">
              OFERTA EXPIRA EN 7 DÍAS
            </div>

            <div className="mb-6 md:mb-8 mt-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-2">
                {t('pricing.plans.pro.title')}
              </h3>
              <p className="text-sm text-white/35 font-medium">
                {t('pricing.plans.pro.desc').split('.').filter(Boolean).map((sentence, i, arr) => (
                  <span key={i}>
                    {sentence.trim()}.{i < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>

            <div className="mb-6 md:mb-10">
              <div className="mb-1">
                <span className="text-base font-bold text-white/25 line-through decoration-white/15 decoration-2">
                  {t('pricing.plans.pro.oldPrice')}
                </span>
              </div>
              <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
                {t('pricing.plans.pro.price')}
              </span>
              <span className="ml-2 text-white/35 font-bold uppercase text-xs tracking-widest">
                {t('pricing.plans.pro.priceLabel')}
              </span>
              <div className="text-xs text-yellow-400 mt-2 font-medium">Precio especial válido hasta el 28 de Feb</div>
            </div>

            <ul className="mb-8 md:mb-10 space-y-4 text-left flex-grow">
              {proFeatures.map(({ key }) => (
                <li key={key} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {proFeatureIcons[key] || <Check className="h-4 w-4 text-[#3D5AFE]" />}
                  </div>
                  <div>
                    <span className={`font-medium text-white/75 ${key === 'f5' ? 'font-bold text-white/90' : ''}`}>
                      {t(`pricing.plans.pro.${key}`)}
                    </span>
                    {['f2', 'f3', 'f5'].includes(key) && (
                      <a
                        href={key === 'f2' ? 'https://vibecoders.vibecoders.la/roadmap' : key === 'f3' ? 'https://vibecoders.vibecoders.la/feedback' : 'https://www.vibecoders.la/@rosmelortiz'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-[11px] text-white/50 hover:text-white/80 hover:underline font-bold transition-colors"
                      >
                        → {t(`pricing.plans.pro.${key}_example`)}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Auth Buttons - Solid */}
            <div className="mt-auto flex flex-col gap-2.5">
              <div className="flex gap-2 justify-center mb-1">
                <div className="bg-stone-800 rounded px-2 py-1 text-center min-w-[36px]">
                  <span className="block text-white text-sm font-bold leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="block text-[8px] text-white/50 uppercase mt-0.5">días</span>
                </div>
                <div className="text-white/30 font-bold self-start mt-1">:</div>
                <div className="bg-stone-800 rounded px-2 py-1 text-center min-w-[36px]">
                  <span className="block text-white text-sm font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[8px] text-white/50 uppercase mt-0.5">hrs</span>
                </div>
                <div className="text-white/30 font-bold self-start mt-1">:</div>
                <div className="bg-stone-800 rounded px-2 py-1 text-center min-w-[36px]">
                  <span className="block text-white text-sm font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[8px] text-white/50 uppercase mt-0.5">min</span>
                </div>
                <div className="text-white/30 font-bold self-start mt-1">:</div>
                <div className="bg-stone-800 rounded px-2 py-1 text-center min-w-[36px]">
                  <span className="block text-white text-sm font-bold leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[8px] text-white/50 uppercase mt-0.5">seg</span>
                </div>
              </div>
              <button
                onClick={() => onLinkedInClick('paid_card')}
                className="w-full h-14 rounded-xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3D5AFE 0%, #2a3eb1 100%)' }}
              >
                <Linkedin className="h-5 w-5 fill-white" />
                {t('pricing.plans.pro.cta')}
              </button>
              <button
                onClick={() => onGoogleClick('paid_card')}
                className="w-full h-12 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white/60 font-medium text-sm transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('pricing.plans.pro.ctaGoogle')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Pricing Section - Lifetime Deal ─── */
const PricingSection = () => {
  const { t, pricing } = useTranslation('newLanding');
  const { signInWithGoogle, signInWithLinkedIn } = useAuth();
  const [spotsLeft, setSpotsLeft] = useState(37);
  const [totalBuilders, setTotalBuilders] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getLandingStats();
      if (stats) {
        setSpotsLeft(stats.spotsLeft);
        setTotalBuilders(stats.totalBuilders);
      }
    };
    fetchStats();
  }, []);

  const handleGoogleSignIn = async (signupSource?: string) => {
    try {
      if (signupSource) localStorage.setItem('signupSource', signupSource);
      await signInWithGoogle(`${window.location.origin}/me`);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLinkedInSignIn = async (signupSource?: string) => {
    try {
      if (signupSource) localStorage.setItem('signupSource', signupSource);
      await signInWithLinkedIn(`${window.location.origin}/me`);
    } catch (error) {
      console.error('Error signing in with LinkedIn:', error);
    }
  };

  // When spots run out, show freemium banner instead
  if (spotsLeft <= 0) {
    return <ClosedAccessSection totalBuilders={totalBuilders} onLinkedInClick={handleLinkedInSignIn} onGoogleClick={handleGoogleSignIn} />;
  }

  // Use the dynamic spotsLeft in the urgency text
  const urgencyText = t('pricing.urgency', { count: spotsLeft });
  interface PricingFeature {
    title: string;
    desc?: string;
    included: boolean;
  }

  const visitorFeatures = (pricing?.visitor?.features || []) as PricingFeature[];
  const founderFeatures = (pricing?.founder?.features || []) as PricingFeature[];

  return (
    <section className="bg-white py-28 px-4 sm:px-6 overflow-hidden border-t border-stone-100">
      <div className="mx-auto max-w-5xl">
        {/* Urgency Header - Premium Floating Pill */}
        <div className="mb-20 flex justify-center text-center px-4">
          <div className="group relative flex items-center gap-3 rounded-full bg-stone-900 px-5 py-2 shadow-xl shadow-stone-900/10 hover:scale-105 transition-transform duration-300">
            {/* Pulsing Dot */}
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-stone-100 tracking-wide">
              {t('pricing.urgency').split('{{count}}')[0]}
              <span className="font-bold text-amber-400 text-base mx-1">
                {spotsLeft}
              </span>
              {t('pricing.urgency').split('{{count}}')[1]}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:gap-10 md:grid-cols-2 lg:gap-16 md:items-stretch">
          {/* Card 1: PRIMER LANZAMIENTO */}
          <div className="relative rounded-2xl border border-stone-200 bg-stone-50/50 p-5 sm:p-8 shadow-sm transition-all md:p-10 flex flex-col opacity-60">
            <div className="mb-4 md:mb-8">
              <h3 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-stone-400">
                {t('pricing.visitor.title')}
              </h3>
              <p className="text-sm text-stone-500 font-medium">
                {t('pricing.visitor.subtitle')}
              </p>
            </div>
            
            <div className="mb-6 md:mb-10">
              <span className="text-5xl font-black tracking-tighter text-stone-900">
                $0
              </span>
              <span className="ml-2 text-stone-400 font-bold uppercase text-xs tracking-widest">/ año</span>
            </div>
            
            <ul className="mb-6 md:mb-12 w-full space-y-4 md:space-y-6 text-left">
              {visitorFeatures.map((feature, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${!feature.included ? 'opacity-40' : ''}`}>
                  <div className="mt-1 shrink-0">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-stone-400" />
                    ) : (
                      <X className="h-4 w-4 text-stone-300" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold ${feature.included ? 'text-stone-600' : 'text-stone-400'}`}>
                      {feature.title}
                    </p>
                    {feature.desc && (
                      <p className="mt-0.5 text-xs text-stone-400 leading-snug">
                        {feature.desc}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <Button variant="outline" disabled className="mt-auto w-full border-stone-200 text-stone-400 h-14 rounded-xl font-bold uppercase tracking-widest bg-white">
              {t('pricing.visitor.cta')}
            </Button>
          </div>

          {/* Card 2: BUILDER FUNDADOR */}
          <div className="relative rounded-2xl border-2 border-stone-900 bg-white p-5 sm:p-8 shadow-xl md:p-10 flex flex-col">
            {/* Professional EXCLUSIVE Tag - Black */}
            <div className="absolute -top-3.5 left-10 rounded-md bg-stone-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
              {t('pricing.founder.tag')}
            </div>

            <div className="mb-4 md:mb-8">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-900">
                {t('pricing.founder.title')}
              </h3>
              <p className="text-sm text-stone-500 font-medium">
                {t('pricing.founder.subtitle')}
              </p>
            </div>
            
            <div className="mb-5 md:mb-8">
              <div className="mb-2">
                <span className="text-xl sm:text-2xl font-bold text-stone-400 line-through decoration-stone-400/50 decoration-2">
                  {t('pricing.founder.oldPrice')}
                </span>
                <span className="ml-3 text-6xl sm:text-7xl font-black tracking-tighter text-stone-900">
                  $0
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900 uppercase tracking-widest pl-1">
                {t('pricing.founder.priceText')}
              </p>
            </div>
            
            <ul className="mb-6 md:mb-10 w-full space-y-4 md:space-y-5 text-left flex-grow">
              {founderFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 shrink-0">
                    <Check className="h-5 w-5 text-stone-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-700 text-[15px]">
                      {feature.title}
                    </p>
                    {feature.desc && (
                      <p className="mt-0.5 text-xs text-stone-500 font-medium leading-relaxed">
                        {feature.desc}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Bonus Section - Grayscale/Premium */}
            <div className="mb-5 md:mb-8 rounded-xl bg-stone-100 border border-stone-200 p-4 md:p-5 relative overflow-hidden group-hover:bg-stone-100/80 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Medal className="w-16 h-16 text-stone-900" />
              </div>
              <p className="relative text-xs font-black uppercase tracking-widest text-stone-900 mb-2">
                {t('pricing.founder.bonusTitle')}
              </p>
              <div className="relative">
                <p className="font-bold text-stone-800 text-sm mb-1">
                  {t('pricing.founder.bonusFeature')}
                </p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {t('pricing.founder.bonusDesc')}
                </p>
              </div>
            </div>

            {/* Premium CTA Stack - Direct Auth */}
            <div className="w-full flex flex-col gap-3 mt-auto">
              {/* Primary: LinkedIn (Brand Color) */}
              <Button 
                onClick={() => handleLinkedInSignIn()} 
                className="w-full h-14 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-base shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
              >
                <Linkedin className="h-5 w-5 fill-white" />
                {t('pricing.founder.ctaLinkedIn')}
              </Button>

              {/* Secondary: Google (White/Border) */}
              <Button 
                 onClick={() => handleGoogleSignIn()} 
                 className="w-full h-14 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-base transition-all hover:scale-[1.01] flex items-center justify-center gap-3"
              >
                {/* Google Logo SVG */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {t('pricing.founder.ctaGoogle')}
              </Button>
              
              {/* Trust Features */}
              <p className="text-center text-[10px] text-stone-400 font-medium">
                {t('pricing.founder.trustText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};/* ─── Footer with Manifesto ─── */
const NewFooter = () => {
  const tc = useTranslation('common');
  const { t } = useTranslation('newLanding');

  return (
    <footer className="bg-[#1c1c1c] px-4 py-12 sm:py-14">
      <div className="container mx-auto flex flex-col items-center gap-8">
        {/* Closing Manifesto */}
        <p className="max-w-lg text-center text-lg font-light text-white/40 italic leading-relaxed">
          {t('footer.manifesto')}
        </p>

        {/* Separator */}
        <div className="h-px w-16 bg-white/10" />

        {/* Standard footer content */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 text-xs sm:flex-row sm:text-sm w-full">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <p className="text-white/70">{tc.footer.copyright}</p>
            <div className="flex items-center gap-3">
              <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                {tc.footer.privacy}
              </Link>
              <span className="text-white/40">&middot;</span>
              <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                {tc.footer.terms}
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:gap-1.5">
            <p className="flex items-center gap-1.5 text-white/70">
              {tc.footer.builtWith}{' '}
              <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
              {' '}{tc.footer.in}{' '}
              <img src={canadaFlag} alt="Canada" className="inline-block h-4 w-auto" />
            </p>
            <p className="flex items-center gap-1.5 text-white/70">
              {tc.footer.by}{' '}
              <a
                href="https://www.vibecoders.la/@rosmelortiz"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline underline-offset-4 transition-colors hover:text-white/80"
              >
                {tc.footer.authorName}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ─── Main Page ─── */
const NewLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/me');
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-[#3D5AFE] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        <NewHeroSection />
        <FoundersMarquee />
        <FeatureGrid />
        <AppsShowcase />
        <PricingSection />
      </main>
      <NewWaveDivider fromColor="#ffffff" toColor="#1c1c1c" size="sm" />
      <NewFooter />
    </div>
  );
};

export default NewLanding;
