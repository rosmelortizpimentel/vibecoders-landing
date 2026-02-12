import { Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FounderWelcomeProps {
  founderNumber: number;
  open: boolean;
  onDismiss: () => void;
}

export function FounderWelcome({ founderNumber, open, onDismiss }: FounderWelcomeProps) {
  const { user } = useAuth();

  const handleClose = async () => {
    onDismiss();
    if (user?.id) {
      await supabase
        .from('user_subscriptions' as any)
        .update({ founder_welcome_seen: true } as any)
        .eq('user_id', user.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto p-4 bg-primary/10 rounded-full mb-2">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">
            🎉 ¡Eres Fundador #{founderNumber}!
          </DialogTitle>
          <DialogDescription className="text-base">
            Acceso gratis de por vida. Gracias por creer en la comunidad desde el inicio.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleClose} className="mt-4 w-full">
          ¡Genial, entendido!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
