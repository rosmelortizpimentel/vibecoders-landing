import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingLogos from './FloatingLogos';
import ProfileFileCard from './ProfileFileCard';
import UserMenu from './UserMenu';
import vibecodersLogo from '@/assets/vibecoders-logo.png';

const TOTAL_LOGOS = 10;

const HeroSection = () => {
  const t = useTranslation('hero');
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithLinkedIn } = useAuth();
  const isMobile = useIsMobile();
  const [absorbedCount, setAbsorbedCount] = useState(0);
  const [triggerExplosion, setTriggerExplosion] = useState(false);

  // Reset animation state when switching between mobile/desktop
  useEffect(() => {
    setAbsorbedCount(0);
    setTriggerExplosion(false);
  }, [isMobile]);

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

  const handleExplosion = useCallback(() => {
    setTriggerExplosion(true);
  }, []);

  const handleExplosionComplete = useCallback(() => {
    setTriggerExplosion(false);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-8 md:pt-16 overflow-hidden bg-[#3D5AFE]">
      <UserMenu />
      {/* Top gradient overlay - white fade */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-48 md:h-64"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 100%)'
        }}
      />

      {/* Floating IDE Logos - SOLO DESKTOP (evita conflicto de estados en mobile) */}
      {!isMobile && (
        <FloatingLogos 
          onAbsorbedCountChange={setAbsorbedCount}
          triggerExplosion={triggerExplosion}
          onExplosionComplete={handleExplosionComplete}
        />
      )}

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Logo VIBECODERS */}
        <div 
          className="mb-8 animate-fade-in opacity-0 flex justify-center"
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
          className="mb-6 animate-fade-in text-base font-medium text-white/90 opacity-0 md:text-lg"
          style={{ animationDelay: '0.1s' }}
        >
          {t.badge}
        </p>

        {/* DESKTOP: Headline → Subheadline → ProfileFileCard */}
        {!isMobile && (
          <>
            <h1 
              className="mb-6 animate-fade-in text-5xl font-bold leading-tight tracking-tight text-white opacity-0 lg:text-6xl"
              style={{ animationDelay: '0.2s' }}
            >
              {t.headline}
            </h1>
            <p 
              className="mx-auto mb-8 max-w-2xl animate-fade-in text-lg text-white/80 opacity-0"
              style={{ animationDelay: '0.3s' }}
            >
              {t.subheadline}
            </p>
            <div 
              className="mb-8 flex justify-center animate-fade-in opacity-0"
              style={{ animationDelay: '0.15s' }}
            >
              <ProfileFileCard 
                absorbedCount={absorbedCount}
                totalLogos={TOTAL_LOGOS}
                className="w-[150px] h-[160px]"
                onExplosion={handleExplosion}
              />
            </div>
          </>
        )}

        {/* MÓVIL: Headline → Subheadline → Zona de animación */}
        {isMobile && (
          <>
            <h1 
              className="mb-4 animate-fade-in text-3xl font-bold leading-tight tracking-tight text-white opacity-0"
              style={{ animationDelay: '0.15s' }}
            >
              {t.headline}
            </h1>
            <p 
              className="mx-auto mb-6 max-w-2xl animate-fade-in text-base text-white/80 opacity-0"
              style={{ animationDelay: '0.2s' }}
            >
              {t.subheadline}
            </p>
            <div 
              className="relative w-full flex flex-col items-center mb-6 animate-fade-in opacity-0"
              style={{ animationDelay: '0.25s' }}
            >
              {/* Zona de logos que se mueven horizontalmente */}
              <div className="relative h-[60px] w-full overflow-visible">
                <FloatingLogos 
                  onAbsorbedCountChange={setAbsorbedCount}
                  triggerExplosion={triggerExplosion}
                  onExplosionComplete={handleExplosionComplete}
                  isMobileContainer={true}
                />
              </div>
              
              {/* ProfileFileCard debajo */}
              <div className="mt-4">
                <ProfileFileCard 
                  absorbedCount={absorbedCount}
                  totalLogos={TOTAL_LOGOS}
                  className="w-[130px] h-[140px]"
                  onExplosion={handleExplosion}
                />
              </div>
            </div>
          </>
        )}

        {/* Conditional: Logged in vs Not logged in */}
        {user ? (
          /* Usuario logueado: Saludo + botón perfil */
          <div 
            className="mx-auto mb-8 flex max-w-md animate-fade-in flex-col items-center gap-4 opacity-0"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-lg text-white/90">
              {t.loggedIn.greeting}, {user.user_metadata?.full_name?.split(' ')[0] || 'Vibecoder'}!
            </p>
            <Button
              onClick={() => navigate('/me')}
              className="h-12 gap-2 px-6 font-semibold bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/80"
            >
              {t.loggedIn.viewProfile}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Usuario no logueado: CTA directo con Google */
          <div 
            className="mx-auto mb-8 flex w-full max-w-xl animate-fade-in flex-col items-center gap-4 opacity-0 px-2 sm:px-0"
            style={{ animationDelay: '0.4s' }}
          >
            {/* Urgency text */}
            <p className="flex items-center gap-2 text-sm text-white/80">
              <AlertTriangle className="h-4 w-4" />
              {t.notLoggedIn.urgency}
            </p>
            
            {/* Auth Buttons Group */}
            <div className="flex flex-col sm:flex-row w-full gap-3">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                className="group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-6 text-base font-semibold text-gray-800 ring-1 ring-black/5 transition-all duration-200 hover:ring-black/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98]"
                style={{ minHeight: '64px', boxShadow: '0 4px 14px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              {/* LinkedIn Sign In Button */}
              <button
                onClick={handleLinkedInSignIn}
                className="group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 text-base font-semibold text-white ring-1 ring-white/20 transition-all duration-200 hover:ring-white/40 hover:shadow-[0_8px_30px_rgba(0,119,181,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                style={{ minHeight: '64px', background: 'linear-gradient(135deg, #0077B5 0%, #005582 100%)', boxShadow: '0 4px 14px rgba(0,119,181,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
              >
                <Linkedin className="h-5 w-5 fill-white" />
                Continuar con LinkedIn
              </button>
            </div>
            
            {/* Microcopy */}
            <p className="text-sm text-white/70">
              {t.notLoggedIn.microcopy}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
