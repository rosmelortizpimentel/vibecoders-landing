import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';

const Cookies = () => {
  const t = useTranslation('legal');

  // Fallback if translations are not yet loaded or missing
  const cookiesData = t.cookies || {
    title: "Política de Cookies",
    lastUpdated: "Última actualización: 21 de febrero de 2026",
    sections: [
      {
        title: "1. ¿Qué son las cookies?",
        content: "Las cookies son pequeños archivos de texto que se colocan en su dispositivo para recopilar información de registro estándar de Internet y de comportamiento. Cuando visita vibecoders.la, podemos recopilar información automáticamente a través de cookies."
      },
      {
        title: "2. ¿Cómo usamos las cookies?",
        content: "Utilizamos cookies para:",
        list: [
          "Mantener su sesión activa de forma segura.",
          "Entender cómo usa y navega por nuestra plataforma (usando Microsoft Clarity).",
          "Guardar sus preferencias, como el idioma o el tema visual."
        ]
      },
      {
        title: "3. Tipos de cookies que usamos",
        content: "Nuestra plataforma utiliza principalmente:",
        list: [
          "Esenciales: Necesarias para el funcionamiento técnico de la plataforma y la autenticación.",
          "Analíticas: Utilizamos Microsoft Clarity para registrar estadísticas de uso (clics, navegación, mapas de calor) de forma anonimizada, con el fin de mejorar la experiencia del producto. Esto requiere de cookies de terceros operadas por Microsoft."
        ]
      },
      {
        title: "4. Control de Cookies",
        content: "Desde el panel de 'Privacidad' en la configuración de su cuenta, puede desactivar en cualquier momento la recopilación de datos de Microsoft Clarity. Además, puede configurar su navegador para rechazar todas las cookies, aunque esto podría afectar el funcionamiento de la plataforma."
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Blue with white text */}
      <header className="bg-[#3D5AFE]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common?.backToHome || "Volver al inicio"}
          </Link>
          <Link to="/" className="font-display text-lg font-semibold text-white">
            {t.common?.logo || "vibecoders.la"}
          </Link>
        </div>
      </header>

      {/* Content - White background */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1c1c1c] mb-2">
          {cookiesData.title}
        </h1>
        <p className="text-sm text-[#1c1c1c]/50 mb-8">
          {cookiesData.lastUpdated}
        </p>

        <div className="space-y-8">
          {cookiesData.sections.map((section: any, index: number) => (
            <section key={index} className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-[#1c1c1c]">
                {section.title}
              </h2>
              <p className="text-[#1c1c1c]/70 leading-relaxed">
                {section.content}
              </p>
              {section.list && (
                <ul className="list-disc list-inside space-y-1 text-[#1c1c1c]/70 ml-2">
                  {section.list.map((item: string, i: number) => (
                    <li key={i} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
