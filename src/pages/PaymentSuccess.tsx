import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState(5);
  const [synced, setSynced] = useState(false);

  // Verify and sync the Stripe session as a fallback
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setSynced(true);
      return;
    }

    supabase.functions
      .invoke('verify-session', { body: { session_id: sessionId } })
      .then(({ data, error }) => {
        if (error) {
          console.error('verify-session error:', error);
        } else if (data?.synced) {
          console.log('Subscription synced via verify-session');
          // Invalidate subscription cache so the UI reflects the new tier
          queryClient.invalidateQueries({ queryKey: ['subscription'] });
        }
        setSynced(true);
      })
      .catch((err) => {
        console.error('verify-session failed:', err);
        setSynced(true);
      });
  }, [searchParams, queryClient]);

  // Start countdown only after sync attempt is done
  useEffect(() => {
    if (!synced) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/home', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, synced]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            {synced ? (
              <CheckCircle className="w-10 h-10 text-primary" />
            ) : (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {synced ? '¡Pago confirmado!' : 'Verificando pago...'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {synced
              ? 'Tu suscripción Builder Pro está activa.'
              : 'Estamos confirmando tu suscripción...'}
          </p>
        </div>

        {synced && (
          <>
            <div className="bg-card border border-border rounded-xl p-4 space-y-2 text-left">
              <p className="text-sm font-medium text-foreground">Ya tienes acceso completo a:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {[
                  '✓ Apps ilimitadas',
                  '✓ Book Call y Servicios',
                  '✓ Bóveda completa',
                  '✓ Testing prioritario',
                  '✓ Roadmap',
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Button onClick={() => navigate('/home', { replace: true })} className="w-full">
                Ir a mi Dashboard →
              </Button>
              <p className="text-xs text-muted-foreground">
                Redirigiendo automáticamente en {countdown}s...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

