import { useState, FormEvent } from 'react';
import { ArrowRight, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import FloatingLogos from './FloatingLogos';

const HeroSection = () => {
  const t = useTranslation('hero');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 overflow-hidden">
      {/* Floating IDE Logos */}
      <FloatingLogos />

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
          className="mx-auto mb-10 max-w-2xl animate-fade-in text-base text-white/80 opacity-0 md:text-lg"
          style={{ animationDelay: '0.3s' }}
        >
          {t.subheadline}
        </p>

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
