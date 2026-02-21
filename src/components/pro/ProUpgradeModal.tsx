import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Map, MessageSquare, Megaphone, Phone, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proFeatures = [
  { key: 'f1', included: true },
  { key: 'f2', included: true },
  { key: 'f3', included: true },
  { key: 'f4', included: true },
  { key: 'f5', included: true },
  { key: 'f6', included: true },
];

const proFeatureIcons: Record<string, React.ReactNode> = {
  f1: <Check className="h-4 w-4 text-[#3D5AFE]" />,
  f2: <Map className="h-4 w-4 text-[#3D5AFE]" />,
  f3: <MessageSquare className="h-4 w-4 text-[#3D5AFE]" />,
  f4: <Megaphone className="h-4 w-4 text-[#3D5AFE]" />,
  f5: <Phone className="h-4 w-4 text-[#3D5AFE]" />,
  f6: <ShieldCheck className="h-4 w-4 text-[#3D5AFE]" />,
};

export function ProUpgradeModal({ open, onOpenChange }: ProUpgradeModalProps) {
  const { t } = useTranslation('newLanding');
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
      <DialogContent className="max-w-[440px] w-[95vw] p-0 border-0 bg-transparent shadow-none [&>button]:text-white/60 [&>button]:hover:text-white max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto no-scrollbar">
        <div className="relative rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 md:p-10 flex flex-col overflow-hidden m-2 shadow-2xl">
          {/* Decorative background gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#3D5AFE]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

          {/* Badge */}
          <div className="absolute top-6 right-6 rounded-full bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3D5AFE] shadow-sm z-10">
            {t('pricing.plans.pro.badge')}
          </div>

          <div className="mb-6 md:mb-8 mt-2 relative">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3D5AFE] mb-3">
              {t('pricing.plans.pro.title')}
            </h3>
            <p className="text-[15px] text-zinc-400 font-medium leading-relaxed">
              {t('pricing.plans.pro.desc').split('.').filter(Boolean).map((sentence, i, arr) => (
                <span key={i}>
                  {sentence.trim()}.{i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          <div className="mb-6 md:mb-8">
            <div className="mb-1">
              <span className="text-base font-bold text-white/25 line-through decoration-white/15 decoration-2">
                {t('pricing.plans.pro.oldPrice')}
              </span>
            </div>
            <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
              {t('pricing.plans.pro.price')}
            </span>
            <span className="ml-2 text-white/35 font-bold uppercase text-xs tracking-widest">
              {t('pricing.plans.pro.priceLabel')}
            </span>
          </div>

          <ul className="mb-8 md:mb-10 space-y-4 text-left flex-grow">
            {proFeatures.map(({ key }) => (
              <li key={key} className="flex items-start gap-3 text-[14px]">
                <div className="mt-1 shrink-0 p-0.5 rounded-full bg-[#3D5AFE]/10">
                  {proFeatureIcons[key] || <Check className="h-3 w-3 text-[#3D5AFE]" />}
                </div>
                <span className={`font-medium ${key === 'f5' ? 'text-white font-bold' : 'text-zinc-300'}`}>
                  {t(`pricing.plans.pro.${key}`)}
                </span>
              </li>
            ))}
          </ul>

          {/* Checkout Button */}
          <div className="mt-auto flex flex-col gap-4">
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] shadow-[0_8px_30px_rgb(61,90,254,0.3)] hover:shadow-[0_8px_40px_rgb(61,90,254,0.4)] border border-[#3D5AFE]/50"
              style={{ background: 'linear-gradient(135deg, #3D5AFE 0%, #1A237E 100%)' }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  {t('pricing.plans.pro.cta').replace('Reservar por', 'Suscribirme por')}
                </>
              )}
            </Button>

            <span className="text-[11px] font-medium text-center text-zinc-500 uppercase tracking-widest">
              {t('pricing.plans.pro.footer')}
            </span>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
