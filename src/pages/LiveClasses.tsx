import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Video, Clock, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const LiveClasses = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* Premium Header - Matching NewLanding style */}
      <header className="relative bg-[#3D5AFE] py-12 sm:py-20 px-4 overflow-hidden">
        {/* Subtle background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-all bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm mb-8 border border-white/10 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-widest animate-fade-in">
                <Video className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                Vibe Coding en Vivo
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight animate-fade-in-up">
                Clases en Vivo
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Únete a nuestras sesiones interactivas de Vibe Coding y construye el futuro en directo con nuestra comunidad.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Wave Decorative Divider */}
      <div className="relative w-full overflow-hidden bg-[#3D5AFE]">
        <svg
          className="relative block w-full h-[40px] sm:h-[60px] md:h-[80px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 C300,100 900,20 1200,80 L1200,120 L0,120 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* Main Content - Calendar Embed */}
      <main className="flex-1 bg-white relative">
        {/* Modern Dot Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl relative z-10">
          <div className="flex flex-col gap-12">
            {/* Embedded Calendar */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-2 sm:p-4 overflow-hidden">
                <div className="relative w-full min-h-[600px] md:min-h-[750px] bg-stone-50 rounded-[1.5rem] overflow-hidden">
                  <iframe
                    src="https://luma.com/embed/calendar/cal-DuvaWovHvFhmaIk/events"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'transparent'
                    }}
                    allowFullScreen={true}
                    aria-hidden="false"
                    tabIndex={0}
                    title="Luma Calendar"
                  />
                  
                  {/* Premium Frame Detail */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#3D5AFE]/20 to-transparent" />
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 text-white shadow-xl">
                <div>
                  <h4 className="font-bold text-lg">¿Quieres ser ponente?</h4>
                  <p className="text-white/60 text-sm">Escríbeme para agendar tu sesión de Vibe Coding.</p>
                </div>
                <Button 
                  asChild
                  className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white font-bold h-11 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#3D5AFE]/20"
                >
                  <a href="https://wa.me/14376062056" target="_blank" rel="noopener noreferrer">
                    Escribir por WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LiveClasses;
