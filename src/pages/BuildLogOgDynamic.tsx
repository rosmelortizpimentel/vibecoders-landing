import { Badge } from '@/components/ui/badge';
import { ExternalLink, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { BuildLogSidebar } from '@/components/buildlog/BuildLogSidebar';
import { StackCard } from '@/components/buildlog/StackCard';
import { ProTipCallout } from '@/components/buildlog/ProTipCallout';
import { OgFlowDiagram } from '@/components/buildlog/OgFlowDiagram';

// Import platform logos
import vercelLogo from '@/assets/logos/vercel.svg';
import supabaseLogo from '@/assets/logos/supabase.svg';

export default function BuildLogOgDynamic() {
  return (
    <main className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Main Article Column */}
          <article className="min-w-0">
            {/* Header */}
            <header className="mb-10">
              <Badge className="mb-4 bg-primary text-white hover:bg-primary/90">
                Reporte Exclusivo #02
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                OG Dinámico para Redes Sociales
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                Cómo logré que LinkedIn, WhatsApp y X muestren tarjetas personalizadas para cada perfil de usuario.
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span>Por Rosmel Ortiz</span>
                <span className="hidden sm:inline">•</span>
                <span>Lectura de 4 min</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-primary font-medium">Acceso Early Adopter</span>
              </div>
            </header>

            {/* Intro: El Problema */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-amber-500" />
                El Problema
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cuando compartes un link en redes sociales, estas muestran una "tarjeta" con imagen, 
                  título y descripción. Esta información se extrae de las meta etiquetas <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">og:</code> del HTML.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  El problema es que vibecoders.la es una <strong>SPA (Single Page Application)</strong>. 
                  Esto significa que el servidor siempre devuelve el mismo archivo <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">index.html</code>, 
                  sin importar qué URL se solicite.
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Resultado: cuando LinkedIn intenta hacer "scrape" de <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">vibecoders.la/@rosmel</code>, 
                  recibe las meta etiquetas genéricas del sitio en lugar de los datos específicos del usuario.
                </p>
              </div>
            </section>

            {/* Sección: La Solución Funcional */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                La Solución (Explicación Simple)
              </h2>
              
              <div className="prose prose-lg max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  La clave es <strong>detectar quién está pidiendo la página</strong>. Los bots de redes 
                  sociales se identifican en sus peticiones con un "User-Agent" específico (por ejemplo: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">LinkedInBot</code>).
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Cuando detectamos que es un bot, en lugar de enviarle la SPA completa, le enviamos 
                  un <strong>HTML minimalista</strong> con solo las meta etiquetas personalizadas del usuario. 
                  Para los humanos en navegadores, seguimos sirviendo la app normal.
                </p>
              </div>
              
              <ProTipCallout variant="info" title="Analogía del Restaurante">
                Es como un restaurante que tiene un menú completo para clientes regulares, 
                pero un menú especial simplificado para críticos de comida que solo necesitan 
                probar los platos destacados.
              </ProTipCallout>
            </section>

            {/* Sección: Arquitectura Técnica */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                La Arquitectura Técnica
              </h2>
              
              <p className="text-gray-600 mb-6">
                La solución funciona con una arquitectura de 3 capas. Así es como fluye una petición 
                de LinkedIn hasta obtener el HTML personalizado:
              </p>
              
              {/* Flow Diagram Component */}
              <div className="mb-8">
                <OgFlowDiagram />
              </div>
              
              {/* Step by Step Explanation */}
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">LinkedIn Scraper solicita /@username</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      El bot envía una petición HTTP con <code className="text-xs bg-white px-1 py-0.5 rounded">User-Agent: LinkedInBot</code>.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Vercel Router detecta el patrón</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Las reglas en <code className="text-xs bg-white px-1 py-0.5 rounded">vercel.json</code> detectan el User-Agent de bot 
                      y reescriben la URL a <code className="text-xs bg-white px-1 py-0.5 rounded">/api/og?username=...</code>.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Vercel Function actúa como proxy</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Una función serverless recibe la petición y la reenvía a Supabase. 
                      Esto evita errores 500 que LinkedIn genera con redirects cross-domain.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Supabase Edge Function genera HTML</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Consulta la base de datos, obtiene los datos del usuario y genera un HTML 
                      con las meta etiquetas personalizadas.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sección: Componentes Clave */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Componentes Clave
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <StackCard
                  logoSrc={vercelLogo}
                  logoAlt="Vercel"
                  title="Vercel Serverless"
                  description={
                    <>
                      <strong className="text-gray-900">api/og.ts</strong>
                      <br />
                      Proxy que evita errores de CORS y redirects. Fuerza <code className="text-xs">Content-Type: text/html</code>.
                      <br />
                      <a href="https://vercel.com/docs/functions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                        Vercel Functions <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  }
                />
                <StackCard
                  logoSrc={supabaseLogo}
                  logoAlt="Supabase"
                  title="Supabase Edge"
                  description={
                    <>
                      <strong className="text-gray-900">og-profile-meta</strong>
                      <br />
                      Genera HTML dinámico con datos del perfil. Usa <code className="text-xs">service_role</code> para acceso seguro.
                      <br />
                      <a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                        Edge Functions <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  }
                />
              </div>
              
              <ProTipCallout variant="warning" title="¿Por qué un proxy intermedio?">
                LinkedIn rechaza con error 500 cualquier respuesta que venga de un redirect 
                a otro dominio. El proxy de Vercel "esconde" la llamada a Supabase y devuelve 
                el HTML directamente desde el mismo dominio.
              </ProTipCallout>
            </section>

            {/* Sección: Testeo y Debug */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Testeo y Debugging
              </h2>
              
              <p className="text-gray-600 mb-4">
                Para probar sin depender de las plataformas (que cachean agresivamente), 
                implementé un parámetro de debug:
              </p>
              
              <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-sm mb-6 overflow-x-auto">
                <p className="text-gray-400"># Prueba manual (simula bot)</p>
                <p>vibecoders.la/@username<span className="text-primary">?og=1</span></p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Facebook Debug Tool
                </a>
                <a
                  href="https://www.linkedin.com/post-inspector/inspect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  LinkedIn Post Inspector
                </a>
              </div>
            </section>

            {/* Conclusión */}
            <section className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                Esta arquitectura me permite tener lo mejor de ambos mundos: una SPA rápida 
                y moderna para los usuarios, y previews personalizados para las redes sociales. 
                El esfuerzo extra vale la pena porque cada perfil compartido se ve profesional 
                y único.
              </p>
            </section>
          </article>

          {/* Sidebar - Desktop */}
          <div className="hidden lg:block">
            <BuildLogSidebar />
          </div>
        </div>

        {/* Sidebar - Mobile (at bottom) */}
        <div className="lg:hidden mt-12">
          <BuildLogSidebar />
        </div>
      </div>
    </main>
  );
}
