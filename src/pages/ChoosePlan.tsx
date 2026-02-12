import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Loader2, Lock, Map, MessageSquare, Megaphone, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

export default function ChoosePlan() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { tier, loading: subLoading, createCheckout } = useSubscription();

  useEffect(() => {
    if (searchParams.get('cancelled') === 'true') {
      toast({
        title: 'Pago cancelado',
        description: 'No se realizó ningún cargo. Puedes intentarlo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!subLoading && tier && tier !== 'pending' && tier !== 'free') {
      navigate('/home', { replace: true });
    }
  }, [tier, subLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  const freeFeatures = [
    { text: 'Valida tus apps con feedback de expertos', included: true },
    { text: 'Networking con +100 fundadores', included: true },
    { text: 'Crea tu perfil y demuestra lo que estás construyendo', included: true, hasExample: true },
    { text: 'Sin acceso a la Suite de Widgets', included: false },
  ];

  const proFeatures = [
    { text: 'Todo lo incluido en Gratis', icon: <Check className="h-4 w-4 text-[#3D5AFE]" /> },
    { text: 'Roadmap público listo: No gastes ni un commit en esto', icon: <Map className="h-4 w-4 text-[#3D5AFE]" /> },
    { text: 'Captura Feedback y Bugs: Sin montar otro backend', icon: <MessageSquare className="h-4 w-4 text-[#3D5AFE]" /> },
    { text: 'Banners sin Deploy: Lanza alertas sin tocar código', icon: <Megaphone className="h-4 w-4 text-[#3D5AFE]" /> },
    { text: 'Vende tus Servicios: Botón "Book Call" integrado a tu Perfil', icon: <Phone className="h-4 w-4 text-[#3D5AFE]" />, bold: true },
    { text: 'Precio de $9.90 congelado de por vida', icon: <ShieldCheck className="h-4 w-4 text-[#3D5AFE]" /> },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="mx-auto max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-[0.15em] mb-6">
            <Lock className="h-3 w-3" />
            Los 100 cupos de Fundador se agotaron
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">
            Desbloquea todo con Pro Builder
          </h1>
          <p className="text-sm sm:text-base text-stone-500 max-w-lg mx-auto leading-relaxed">
            Ahorra +$500/mes reemplazando múltiples herramientas SaaS con una suite integrada
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-10 md:items-stretch">

          {/* Card A: Free — Current Plan */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6 sm:p-8 md:p-10 flex flex-col">
            <div className="mb-6 md:mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
                Vibe Member
              </h3>
              <p className="text-sm text-stone-500 font-medium">
                Para quienes necesitan validar su idea sin gastar.
              </p>
            </div>

            <div className="mb-6 md:mb-10">
              <span className="text-5xl font-black tracking-tighter text-stone-900">$0</span>
              <span className="ml-2 text-stone-400 font-bold uppercase text-xs tracking-widest">
                para siempre
              </span>
            </div>

            <ul className="mb-8 md:mb-12 space-y-4 text-left flex-grow">
              {freeFeatures.map(({ text, included, hasExample }) => (
                <li key={text} className={`flex items-start gap-3 text-sm ${!included ? 'opacity-40' : ''}`}>
                  <div className="mt-0.5 shrink-0">
                    {included ? (
                      <Check className="h-4 w-4 text-stone-400" />
                    ) : (
                      <X className="h-4 w-4 text-stone-300" />
                    )}
                  </div>
                  <div>
                    <span className={`font-medium ${included ? 'text-stone-600' : 'text-stone-400'}`}>
                      {text}
                    </span>
                    {hasExample && (
                      <a
                        href="https://www.vibecoders.la/@rosmelortiz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-xs text-[#3D5AFE] hover:underline font-medium"
                      >
                        Mira un ejemplo →
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <div className="w-full h-12 rounded-xl border border-stone-200 bg-stone-100 text-stone-400 font-semibold text-sm flex items-center justify-center gap-2.5 cursor-default">
                <Check className="w-4 h-4" />
                Tu plan actual
              </div>
            </div>
          </div>

          {/* Card B: Pro */}
          <div className="relative rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 sm:p-8 md:p-10 flex flex-col">
            {/* Badge */}
            <div className="absolute -top-3.5 left-6 sm:left-10 rounded-md bg-[#3D5AFE] px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-sm">
              Pre-Lanzamiento
            </div>

            <div className="mb-6 md:mb-8 mt-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-2">
                Pro Builder + Suite
              </h3>
              <p className="text-sm text-white/35 font-medium">
                Enfócate en funcionalidades core.<br />Nosotros nos encargamos del resto.
              </p>
            </div>

            <div className="mb-6 md:mb-10">
              <div className="mb-1">
                <span className="text-base font-bold text-white/25 line-through decoration-white/15 decoration-2">
                  $59.90
                </span>
              </div>
              <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
                $9.90
              </span>
              <span className="ml-2 text-white/35 font-bold uppercase text-xs tracking-widest">
                / año
              </span>
            </div>

            <ul className="mb-8 md:mb-10 space-y-4 text-left flex-grow">
              {proFeatures.map(({ text, icon, bold }) => (
                <li key={text} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {icon}
                  </div>
                  <span className={`font-medium ${bold ? 'font-bold text-white/90' : 'text-white/75'}`}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <button
                onClick={handlePro}
                disabled={createCheckout.isPending}
                className="w-full h-14 rounded-xl font-bold text-base text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01] shadow-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #3D5AFE 0%, #2a3eb1 100%)' }}
              >
                {createCheckout.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
                Suscribirme por $9.90 →
              </button>
              <p className="text-center text-sm text-white/40 mt-3 font-semibold">
                A partir del 1ro de Marzo costará $59.90/año.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
