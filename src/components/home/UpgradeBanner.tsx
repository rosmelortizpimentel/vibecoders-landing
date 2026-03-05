import { Rocket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export function UpgradeBanner() {
  const { createCheckout } = useSubscription();

  const handleUpgrade = async () => {
    try {
      const result = await createCheckout.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      console.error('Checkout error:', e);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">
            🚀 Upgrade a Builder Pro
          </h3>
          <p className="text-xs text-muted-foreground">
            Desbloquea apps ilimitadas y más — Solo $19.90/año
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={handleUpgrade}
        disabled={createCheckout.isPending}
      >
        {createCheckout.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : null}
        Upgrade ahora →
      </Button>
    </div>
  );
}
