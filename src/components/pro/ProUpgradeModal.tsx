import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BENEFIT_KEYS = [
  'unlimitedApps',
  'bookCall',
  'betaSquads',
  'roadmap',
  'vault',
  'verifiedBadge',
] as const;

export function ProUpgradeModal({ open, onOpenChange }: ProUpgradeModalProps) {
  const { t } = useTranslation('pro');
  const { createCheckout } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const result = await createCheckout.mutateAsync();
      if (result?.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:text-white/60 [&>button]:hover:text-white max-h-[90dvh] overflow-y-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#141414] to-[#0a0a0a] border border-[#c9a44c]/20 shadow-2xl shadow-[#c9a44c]/5">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a44c] to-transparent" />

          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            {/* Badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase border border-[#c9a44c]/40 rounded-full text-[#c9a44c] bg-[#c9a44c]/10">
                {t('badge')}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t('title')}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs mx-auto">
                {t('subtitle')}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {BENEFIT_KEYS.map((key) => (
                <div key={key} className="flex gap-3 items-start">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#c9a44c]/15 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#c9a44c]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-snug">
                      {t(`benefits.${key}.title`)}
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {t(`benefits.${key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="text-center pt-2">
              <span className="text-3xl font-bold text-white">{t('price')}</span>
              <span className="text-sm text-white/40 ml-1">{t('priceUnit')}</span>
            </div>

            {/* CTA */}
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#c9a44c] to-[#b8933f] hover:from-[#d4af5a] hover:to-[#c9a44c] text-black font-bold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-[#c9a44c]/20 hover:shadow-[#c9a44c]/30"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('cta')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Close text */}
            <button
              onClick={() => onOpenChange(false)}
              className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
