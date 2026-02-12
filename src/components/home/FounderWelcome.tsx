import { useState, useEffect } from 'react';
import { X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FounderWelcomeProps {
  founderNumber: number;
}

export function FounderWelcome({ founderNumber }: FounderWelcomeProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `founder_welcome_dismissed`;
    if (localStorage.getItem(key)) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('founder_welcome_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-6">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={handleDismiss}
      >
        <X className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Crown className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">
            🎉 ¡Eres Fundador #{founderNumber}!
          </h3>
          <p className="text-sm text-muted-foreground">
            Acceso gratis de por vida. Gracias por creer en la comunidad desde el inicio.
          </p>
        </div>
      </div>
    </div>
  );
}
