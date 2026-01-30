import { useState, FormEvent, useCallback } from 'react';
import { ArrowRight, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import FloatingLogos from './FloatingLogos';
import ProfileFileCard from './ProfileFileCard';

const TOTAL_LOGOS = 10;

const HeroSection = () => {
  const t = useTranslation('hero');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [absorbedCount, setAbsorbedCount] = useState(0);
  const [triggerExplosion, setTriggerExplosion] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: FormEvent) => {
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
    
    console.log('Email submitted:', trimmedEmail);
    setIsSubmitted(true);
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
      {/* Top gradient overlay - white fade */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-48 md:h-64"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 100%)'
        }}
      />

      {/* Floating IDE Logos */}
      <FloatingLogos 
        onAbsorbedCountChange={setAbsorbedCount}
        triggerExplosion={triggerExplosion}
        onExplosionComplete={handleExplosionComplete}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow - pequeño y simple */}
        <p 
          className="mb-6 animate-fade-in text-base font-medium text-white/90 opacity-0 md:text-lg"
          style={{ animationDelay: '0.1s' }}
        >
          {t.badge}
        </p>

        {/* Headline - grande y bold */}
        <h1 
          className="mb-6 animate-fade-in text-4xl font-bold leading-tight tracking-tight text-white opacity-0 md:text-5xl lg:text-6xl"
          style={{ animationDelay: '0.2s' }}
        >
          {t.headline}
        </h1>

        {/* Subheadline - descripción normal */}
        <p 
          className="mx-auto mb-4 md:mb-8 max-w-2xl animate-fade-in text-base text-white/80 opacity-0 md:text-lg"
          style={{ animationDelay: '0.3s' }}
        >
          {t.subheadline}
        </p>

        {/* Profile File Card - Centered */}
        <div 
          className="mb-8 flex justify-center animate-fade-in opacity-0"
          style={{ animationDelay: '0.35s' }}
        >
          <ProfileFileCard 
            absorbedCount={absorbedCount}
            totalLogos={TOTAL_LOGOS}
            className="w-[130px] h-[140px] md:w-[150px] md:h-[160px]"
            onExplosion={handleExplosion}
          />
        </div>

        {/* Email Form */}
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
              disabled={isSubmitted}
              className={`h-12 gap-2 px-6 font-semibold transition-all duration-300 ${
                isSubmitted 
                  ? 'bg-white/20 text-white' 
                  : 'bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/80'
              }`}
            >
              {isSubmitted ? (
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
          <Users className="h-4 w-4 text-white/90" />
          {t.socialProof}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
