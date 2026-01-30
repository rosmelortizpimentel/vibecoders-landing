import { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import FloatingLogos from './FloatingLogos';
import ProfileFileCard from './ProfileFileCard';
import WaitlistSuccessModal from './WaitlistSuccessModal';
import UserMenu from './UserMenu';
import { registerToWaitlist } from '@/lib/waitlist';

const TOTAL_LOGOS = 10;

const HeroSection = () => {
  const t = useTranslation('hero');
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [absorbedCount, setAbsorbedCount] = useState(0);
  const [triggerExplosion, setTriggerExplosion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError(t.form.error.empty);
      return;
    }
    
    if (!validateEmail(trimmedEmail)) {
      setError(t.form.error.invalid);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await registerToWaitlist(trimmedEmail);
      
      if (result.success) {
        setIsSubmitted(true);
        setAlreadyRegistered(result.alreadyExists);
        setShowModal(true);
      } else {
        setError(result.error || 'Error al registrar');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handleExplosion = useCallback(() => {
    setTriggerExplosion(true);
  }, []);

  const handleExplosionComplete = useCallback(() => {
    setTriggerExplosion(false);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-8 md:pt-16 overflow-hidden">
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
          className="mb-8 animate-fade-in opacity-0"
          style={{ animationDelay: '0.05s' }}
        >
          <span className="font-mono font-bold text-xl md:text-2xl tracking-tight inline-flex items-center gap-1 text-white">
            <span className="text-white/60">{'<'}</span>
            <span>VIBECODERS</span>
            <span className="animate-cursor-blink">_</span>
            <span className="text-white/60">{'>'}</span>
          </span>
        </div>

        {/* Badge */}
        <p 
          className="mb-6 animate-fade-in text-base font-medium text-white/90 opacity-0 md:text-lg"
          style={{ animationDelay: '0.1s' }}
        >
          {t.badge}
        </p>

        {/* DESKTOP: Headline → Subheadline (antes del file) */}
        <div className="hidden md:block">
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
        </div>

        {/* DESKTOP: Profile File Card */}
        <div 
          className="hidden md:flex mb-8 justify-center animate-fade-in opacity-0"
          style={{ animationDelay: '0.15s' }}
        >
          <ProfileFileCard 
            absorbedCount={absorbedCount}
            totalLogos={TOTAL_LOGOS}
            className="w-[150px] h-[160px]"
            onExplosion={handleExplosion}
          />
        </div>

        {/* MÓVIL: Headline → Subheadline (antes de la animación) */}
        <div className="md:hidden">
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
        </div>

        {/* MÓVIL: Zona de animación - logos arriba, file abajo */}
        <div 
          className="md:hidden relative w-full flex flex-col items-center mb-6 animate-fade-in opacity-0"
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

        {/* Conditional: Logged in vs Not logged in */}
        {user ? (
          /* Usuario logueado: Saludo + botón perfil */
          <div 
            className="mx-auto mb-8 flex max-w-md animate-fade-in flex-col items-center gap-4 opacity-0"
            style={{ animationDelay: '0.4s' }}
          >
            <p className="text-lg text-white/90">
              ¡Hola, {user.user_metadata?.full_name?.split(' ')[0] || 'Vibecoder'}!
            </p>
            <Button
              onClick={() => navigate('/profile')}
              className="h-12 gap-2 px-6 font-semibold bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/80"
            >
              Ver mi perfil
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Usuario no logueado: Formulario + social proof */
          <>
            <form 
              onSubmit={handleSubmit}
              className="mx-auto mb-8 flex max-w-md animate-fade-in flex-col gap-3 opacity-0"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Input
                  type="text"
                  placeholder={t.form.placeholder}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  disabled={isSubmitted}
                  className={`h-12 flex-1 border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-white focus:ring-white/50 ${
                    error ? 'border-white/70' : ''
                  }`}
                />
                <Button
                  type="submit"
                  disabled={isSubmitted || isSubmitting}
                  className={`h-12 gap-2 px-6 font-semibold transition-all duration-300 ${
                    isSubmitted 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/80'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t.form.success}
                    </>
                  ) : (
                    <>
                      {t.form.button}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Error Message - blanco */}
              {error && (
                <p className="text-sm text-white animate-fade-in">
                  {error}
                </p>
              )}
            </form>

            {/* Social Proof */}
            <p 
              className="flex animate-fade-in items-center justify-center gap-2 text-sm text-white/70 opacity-0"
              style={{ animationDelay: '0.5s' }}
            >
              <span className="text-[#1c1c1c]">🔒</span>
              {t.socialProof}
            </p>
          </>
        )}
      </div>

      <WaitlistSuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        alreadyRegistered={alreadyRegistered}
      />
    </section>
  );
};

export default HeroSection;
