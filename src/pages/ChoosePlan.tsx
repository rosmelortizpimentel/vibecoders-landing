import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Zap, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

export default function ChoosePlan() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { tier, loading: subLoading, setFreeTier, createCheckout } = useSubscription();

  // Show cancelled toast
  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      toast({
        title: 'Pago cancelado',
        description: 'No se realizó ningún cargo. Puedes intentarlo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  // Redirect if already has a tier
  useEffect(() => {
    if (!subLoading && tier && tier !== 'pending') {
      navigate('/home', { replace: true });
    }
  }, [tier, subLoading, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleFree = async () => {
    try {
      await setFreeTier.mutateAsync();
      navigate('/home', { replace: true });
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo activar el plan gratuito.', variant: 'destructive' });
    }
  };

  const handlePro = async () => {
    try {
      const result = await createCheckout.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo crear la sesión de pago.', variant: 'destructive' });
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
            🔥 Los 100 cupos de Fundador se agotaron
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Elige tu plan para continuar
          </h1>
          <p className="text-muted-foreground text-lg">
            Comienza gratis o desbloquea todo con Builder Pro
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="relative rounded-2xl border border-border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Primer Lanzamiento</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground ml-1">/ año</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Gratis para siempre</p>
            </div>

            <ul className="space-y-3">
              {[
                'Perfil público',
                '1 app gratis*',
                'Bóveda pública',
                'Testing**',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              *Desbloquea más apps ganando puntos<br />
              **Solo si testeas primero
            </p>

            <Button
              onClick={handleFree}
              variant="outline"
              className="w-full"
              disabled={setFreeTier.isPending}
            >
              {setFreeTier.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Empezar gratis
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-6 space-y-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                RECOMENDADO
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Builder Pro</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-foreground">$24</span>
                <span className="text-muted-foreground ml-1">/ año</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Todo incluido</p>
            </div>

            <ul className="space-y-3">
              {[
                'Todo lo del plan gratuito',
                'Apps ilimitadas',
                'Book Call',
                'Bóveda completa',
                'Testing sin requisitos',
                'Insignia Pro',
                'Acceso al Roadmap',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handlePro}
              className="w-full"
              disabled={createCheckout.isPending}
            >
              {createCheckout.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Suscribirme →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
