import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Check, Minus, ArrowRight, Loader2, X } from 'lucide-react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useSubscription } from "@/hooks/useSubscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/useTranslation";
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";

interface FeatureRow {
  label: string;
  tooltip?: string;
  free: ReactNode | boolean | string;
  pro: ReactNode | boolean | string;
  soon?: boolean;
}

interface FeatureGroup {
  title: string;
  features: FeatureRow[];
}

function CountdownTimer() {
  const targetDate = useMemo(() => new Date("2026-03-31T23:59:59"), []);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; expired: boolean } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute is enough for DD HH MM, but user asked for real-time second updates if they wanted seconds. 
    // Wait, user said "Se actualiza cada segundo en tiempo real". 
    // They didn't ask for seconds in the display (DD — HH — MM), but they want it to update accurately.
    // I'll update every second as requested.

    const secondTimer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(secondTimer);
    };
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-tighter">Oferta expirada</p>;
  }

  const Block = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-[#f5f5f5] dark:bg-zinc-800/50 rounded-[8px] px-2 py-1.5 min-w-[54px]">
      <span className="text-[16px] font-black text-zinc-900 dark:text-white leading-none">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mt-1 tracking-tighter">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5 mt-3 mb-4">
      <Block value={timeLeft.days} label="DÍAS" />
      <span className="text-zinc-300 font-bold">:</span>
      <Block value={timeLeft.hours} label="HRS" />
      <span className="text-zinc-300 font-bold">:</span>
      <Block value={timeLeft.minutes} label="MIN" />
      <span className="text-zinc-300 font-bold">:</span>
      <Block value={timeLeft.seconds} label="SEG" />
    </div>
  );
}

export function PremiumComparisonModal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { createCheckout } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const tPro = useTranslation('pro');
  const comp = tPro.comparison;
  const groups = (comp?.groups || []) as FeatureGroup[];
  const { t } = useTranslation('newLanding');

  const handlePro = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte');
      navigate('/login');
      return;
    }
    toast.loading('Preparando tu suscripción segura con Stripe...', { id: 'checkout' });
    createCheckout.mutate(undefined, {
      onSuccess: (data: { url: string }) => {
        toast.success('Redirigiendo a Stripe...', { id: 'checkout' });
        window.location.href = data.url;
      },
      onError: (err: { message?: string }) => {
        toast.error(err.message || 'Error al procesar el pago', { id: 'checkout' });
        console.error(err);
      }
    });
  };

  const renderValue = (val: ReactNode | boolean | string, isPro: boolean = false) => {
    if (isPro) {
      if (val === false) return <Minus className="w-4 h-4 mx-auto text-[#dddddd] dark:text-zinc-700" strokeWidth={2.5} />;
      return <Check className="w-4 h-4 mx-auto text-primary" strokeWidth={3} />;
    } else {
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        // Excepciones de texto pequeño
        if (lower.includes('test') || lower.includes('privado') || lower.includes('compra')) {
          return <span className="text-[10px] text-zinc-500 leading-[1.1] block px-1 font-medium">{val}</span>;
        }
        
        // Other text just show checkmark
        return <Check className="w-4 h-4 mx-auto text-[#aaaaaa] dark:text-zinc-600" strokeWidth={2.5} />;
      }
      if (val === true) return <Check className="w-4 h-4 mx-auto text-[#aaaaaa] dark:text-zinc-600" strokeWidth={2.5} />;
      return <Minus className="w-4 h-4 mx-auto text-[#dddddd] dark:text-zinc-700" strokeWidth={2.5} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent hideClose className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Escala con VibeCoders Builder Pro</DialogTitle>
        <DialogDescription className="sr-only">
          Compara los beneficios de nuestro plan Builder Pro y obtén acceso a analíticas avanzadas, gestión de feedback y mucho más.
        </DialogDescription>
        <div className="flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Left Column (Info & Free Plan CTA) */}
          <div className="md:w-[280px] lg:w-[300px] shrink-0 p-4 md:p-5 bg-zinc-50 dark:bg-zinc-900/50 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-center z-10 relative">
            
            <div className="inline-flex items-start self-start px-3 py-1 mb-1 rounded-full border border-zinc-900 dark:border-zinc-200 text-zinc-900 dark:text-zinc-200 text-[9px] font-bold tracking-widest uppercase text-center bg-transparent">
              OFERTA LIMITADA
            </div>
            
            <CountdownTimer />

            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2 md:mb-3 leading-tight" dangerouslySetInnerHTML={{ __html: (comp?.title || 'Escala con **VibeCoders Builder Pro**.').replace(/\*\*(.*?)\*\*/g, '<span class="text-primary font-extrabold">$1</span>') }}>
            </h2>
            <p className="text-[12px] md:text-[13px] text-slate-600 dark:text-zinc-400 mb-3 md:mb-4 max-w-sm leading-snug">
              {comp?.subtitle || 'Tu proyecto merece más que existir — merece crecer. Builder Pro te da todo lo que necesitas para lograrlo.'}
            </p>

            <div className="space-y-1 md:space-y-2 max-w-sm mt-0 md:mt-1">
              <div className="flex flex-col gap-0.5 md:gap-[3px] mb-2 md:mb-4 relative border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 md:pl-4 py-0.5 md:py-1">
                <div className="flex items-center gap-2 opacity-40 line-through text-[10px] font-medium text-zinc-500">
                  <span>100 Fundadores — Gratis (cerrado)</span>
                </div>
                <div className="flex items-center gap-2 opacity-40 line-through text-[10px] font-medium text-zinc-500">
                  <span>Early Adopters — $9.90/año (cerrado)</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-white bg-primary py-1 md:py-1.5 px-2 md:px-3 rounded shadow-lg border border-primary -ml-3 md:-ml-4 my-1 relative">
                  <div className="absolute left-[calc(-0.25rem-1px)] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-900 md:left-[-5px]" />
                  <span className="leading-none pt-0.5">$19.90/año (hasta 31 mar)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
                  <span>$29.90/año (1 de abril)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
                  <span>$39.90/año (1 de mayo)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
                  <span>$49.90/año (1 de junio)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
                  <span>$59.90/año (precio final)</span>
                </div>
              </div>
              <p className="text-[9px] md:text-[10px] text-zinc-500 dark:text-zinc-500 mb-2 md:mb-4 italic leading-tight">
                {t('pricing.plans.pro.footer', { defaultValue: 'Tu precio se congela de por vida al momento de suscribirte' })}
              </p>
            </div>
            
            <div className="mt-2 md:mt-3 max-w-sm hidden md:block">
              <Button 
                onClick={handlePro}
                disabled={createCheckout.isPending}
                className="w-full h-9 md:h-10 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-[12px] md:text-[13px] font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                {createCheckout.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="pt-[1px]">{comp?.cta || 'Quiero escalar con Builder Pro'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
              <p className="text-[9px] md:text-[10px] text-center text-zinc-400 mt-2 md:mt-3 font-medium">
                {comp?.guarantee || 'Sin compromisos. Sin complicaciones.'}
              </p>
            </div>
          </div>

          {/* Right Column (Comparison Table) */}
          <div className="flex-1 p-4 md:p-5 lg:p-6 bg-white dark:bg-zinc-950 flex flex-col h-full w-full">
            <div className="grid grid-cols-12 shrink-0 px-2 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-10 pt-2 pb-3 pr-10">
              <div className="col-span-8 md:col-span-8 flex items-end">
              </div>
              <div className="col-span-2 md:col-span-2 text-center flex flex-col justify-center">
                <span className="text-[12px] font-medium text-[#999999]">{comp?.colFree || 'Builder'}</span>
              </div>
              <div className="col-span-2 md:col-span-2 text-center flex flex-col justify-center bg-[#f5f5f5] dark:bg-zinc-900 rounded-[8px] py-1 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <span className="text-[12px] font-bold text-[#111111] dark:text-white">{comp?.colPro || 'Builder Pro'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
              <TooltipProvider delayDuration={0}>
                {groups.map((group, groupIdx) => (
                  <div key={groupIdx} className="mb-0">
                    {/* Header */}
                    <div className="grid grid-cols-12 items-end pt-[12px] pb-1 px-2">
                      <div className="col-span-12">
                        <h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-[0.08em]">
                          {group.title}
                        </h4>
                      </div>
                    </div>
                    {/* Features block */}
                    <div className="space-y-0">
                      {group.features.map((feature, fIdx) => {
                        const hasTooltip = !!(feature.tooltip || typeof feature.pro === 'string');
                        
                        // Overrides for Free column specific labels
                        let freeValue = feature.free;
                        if (feature.label.includes('Roadmap')) freeValue = "Solo privado";
                        if (feature.label.includes('Marketplace')) freeValue = "Solo compra";

                        return (
                          <div key={fIdx} className="grid grid-cols-12 items-center min-h-[32px] group relative py-0.5 border-b border-[#f0f0f0] dark:border-zinc-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors px-2 pr-10 rounded-md cursor-default">
                            {/* Feature label */}
                            <div className="col-span-8 md:col-span-8 pr-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[13px] font-normal text-[#1a1a1a] dark:text-zinc-300 leading-snug">
                                  {feature.label}
                                </span>
                                {feature.soon && (
                                  <span className="text-[10px] text-zinc-400 italic shrink-0 whitespace-nowrap">(próximamente)</span>
                                )}
                              </div>
                            </div>
                            {/* Free Column */}
                            <div className="col-span-2 md:col-span-2 text-center flex flex-col items-center justify-center">
                               {renderValue(freeValue)}
                            </div>
                            {/* Pro Column */}
                            <div className="col-span-2 md:col-span-2 text-center flex flex-col items-center justify-center">
                              {hasTooltip ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center gap-1 cursor-help group/tooltip">
                                      {renderValue(feature.pro, true)}
                                      <Info className="w-3 h-3 text-[#bbbbbb] dark:text-zinc-600 group-hover/tooltip:text-primary transition-colors" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side="top" 
                                    align="center"
                                    sideOffset={4}
                                    className="bg-[#1a1a1a] text-white border border-white/20 shadow-2xl rounded-[8px] max-w-[220px] w-max px-3.5 py-3 text-[13px] leading-snug font-medium pointer-events-none z-[9999]"
                                  >
                                    <p>{(feature.tooltip || feature.pro) as string}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                renderValue(feature.pro, true)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50 md:hidden w-full">
              <Button 
                onClick={handlePro}
                disabled={createCheckout.isPending}
                className="w-full h-9 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-[12px] font-bold shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {createCheckout.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="pt-[1px]">{comp?.cta || 'Quiero escalar con Builder Pro'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Close Button */}
        <DialogPrimitive.Close className="absolute right-2 top-2 z-[60] p-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all hover:scale-110 active:scale-95 shadow-sm">
          <X className="w-4 h-4" />
          <span className="sr-only">Cerrar</span>
        </DialogPrimitive.Close>
      </DialogContent>
    </Dialog>
  );
}
