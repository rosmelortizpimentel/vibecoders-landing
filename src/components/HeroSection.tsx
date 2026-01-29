import { useState, FormEvent } from 'react';
import { Rocket, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

const HeroSection = () => {
  const t = useTranslation('hero');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log('Email submitted:', email);
      setIsSubmitted(true);
    }
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 overflow-hidden">
      {/* Large radial gradient orb - inspired by reference */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Outer blue/violet glow */}
        <div 
          className="absolute h-[800px] w-[800px] rounded-full opacity-80 blur-3xl md:h-[1000px] md:w-[1000px]"
          style={{
            background: 'radial-gradient(circle, hsl(187 80% 55% / 0.4) 0%, hsl(263 70% 58% / 0.6) 40%, transparent 70%)'
          }}
        />
        {/* Inner magenta/violet core */}
        <div 
          className="absolute h-[500px] w-[500px] rounded-full opacity-90 blur-2xl md:h-[600px] md:w-[600px]"
          style={{
            background: 'radial-gradient(circle, hsl(320 80% 55% / 0.8) 0%, hsl(263 70% 58% / 0.6) 50%, transparent 80%)'
          }}
        />
        {/* Hot center glow */}
        <div 
          className="absolute h-[300px] w-[300px] rounded-full opacity-70 blur-xl md:h-[400px] md:w-[400px]"
          style={{
            background: 'radial-gradient(circle, hsl(25 90% 55% / 0.7) 0%, hsl(340 80% 55% / 0.5) 60%, transparent 100%)'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div 
          className="mb-8 inline-flex animate-fade-in opacity-0"
          style={{ animationDelay: '0.1s' }}
        >
          <Badge 
            variant="outline" 
            className="gap-2 border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
          >
            <Rocket className="h-4 w-4" />
            {t.badge}
          </Badge>
        </div>

        {/* Headline */}
        <h1 
          className="mb-6 animate-fade-in text-4xl font-bold leading-tight tracking-tight text-foreground opacity-0 md:text-5xl lg:text-6xl"
          style={{ animationDelay: '0.2s' }}
        >
          {t.headline}
        </h1>

        {/* Subheadline */}
        <p 
          className="mx-auto mb-10 max-w-2xl animate-fade-in text-lg text-muted-foreground opacity-0 md:text-xl"
          style={{ animationDelay: '0.3s' }}
        >
          {t.subheadline}
        </p>

        {/* Email Form */}
        <form 
          onSubmit={handleSubmit}
          className="mx-auto mb-8 flex max-w-md animate-fade-in flex-col gap-3 opacity-0 sm:flex-row"
          style={{ animationDelay: '0.4s' }}
        >
          <Input
            type="email"
            placeholder={t.form.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitted}
            className="h-12 flex-1 border-border/50 bg-muted/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
          />
          <Button
            type="submit"
            disabled={isSubmitted}
            className={`h-12 gap-2 px-6 font-semibold transition-all duration-300 ${
              isSubmitted 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:glow-violet'
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
        </form>

        {/* Social Proof */}
        <p 
          className="flex animate-fade-in items-center justify-center gap-2 text-sm text-muted-foreground opacity-0"
          style={{ animationDelay: '0.5s' }}
        >
          <Users className="h-4 w-4 text-primary" />
          {t.socialProof}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
