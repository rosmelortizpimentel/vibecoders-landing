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
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
      {/* Subtle gradient background effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
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
