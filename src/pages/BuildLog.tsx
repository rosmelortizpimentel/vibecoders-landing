import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { BuildLogSidebar } from '@/components/buildlog/BuildLogSidebar';
import { StackCard } from '@/components/buildlog/StackCard';
import { ProTipCallout } from '@/components/buildlog/ProTipCallout';
import { WorkflowTimeline, BranchDiagram } from '@/components/buildlog/WorkflowTimeline';

// Import platform logos
import lovableLogo from '@/assets/logos/lovable-icon.png';
import supabaseLogo from '@/assets/logos/supabase.svg';
import vercelLogo from '@/assets/logos/vercel.svg';
import architectureDiagram from '@/assets/buildlog/architecture-diagram.jpeg';

export default function BuildLog() {
  return (
    <main className="flex-1 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">
          {/* Main Article Column */}
          <article className="min-w-0">
            {/* Header */}
            <header className="mb-10">
              <Badge className="mb-4 bg-primary text-white hover:bg-primary/90">
                Reporte Exclusivo #01
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                El Stack del Vibecoder: Cómo construí una arquitectura escalable sin abrir un IDE
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                La receta exacta detrás de vibecoders.la: De Lovable a Producción, sin fricción y con diseño profesional.
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span>Por Rosmel Ortiz</span>
                <span className="hidden sm:inline">•</span>
                <span>Lectura de 5 min</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-primary font-medium">Acceso Early Adopter</span>
              </div>
            </header>

            {/* Intro */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl text-gray-700 leading-relaxed">
                Hace unos días les conté que estoy creando vibecoders.la usando herramientas de desarrollo asistido por IA 
                (Vibe Coding). Pero más allá del hype, les prometí mostrar la parte que casi nadie muestra: la estrategia 
                real detrás del lanzamiento. Porque hacer "vibe coding" no es solo promptear: es saber elegir las 
                herramientas correctas, estructurar un flujo de trabajo profesional, y diseñar con intención para no parecer 
                "una app hecha por IA". Este es el desglose técnico y de diseño que estoy usando para construir vibecoders.la.
              </p>
            </div>

            {/* Section: El Stack */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                El Stack: Velocidad sin instalaciones
              </h2>
              <p className="text-gray-600 mb-6">
                Mi objetivo era claro: lanzar rápido, iterar rápido y mantener una base de código profesional. 
                Estas son las herramientas que elegí:
              </p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StackCard
                  logoSrc={lovableLogo}
                  logoAlt="Lovable"
                  title="Frontend & Generación"
                  description={
                    <>
                      <strong className="text-gray-900">Lovable.</strong>
                      <br />
                      Es la forma más rápida hoy en día de iniciar conectada a Git.
                      <br />
                      <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                        lovable.dev <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  }
                />
                <StackCard
                  logoSrc={supabaseLogo}
                  logoAlt="Supabase"
                  title="Backend"
                  description={
                    <>
                      <strong className="text-gray-900">Supabase.</strong>
                      <br />
                      Maneja la base de datos, el almacenamiento y la autenticación (Google Auth) en un solo lugar.
                      <br />
                      <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                        supabase.com <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  }
                />
                <StackCard
                  logoSrc={vercelLogo}
                  logoAlt="Vercel"
                  title="Despliegue"
                  description={
                    <>
                      <strong className="text-gray-900">Vercel.</strong>
                      <br />
                      Para automatizar el pase a producción.
                      <br />
                      <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                        vercel.com <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  }
                />
              </div>
            </section>

            {/* Section: Arquitectura */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                La Arquitectura y el Flujo de Trabajo
              </h2>
              <p className="text-gray-600 mb-6">
                Aquí es donde muchos proyectos "vibe coded" fallan. Sin una estrategia de ramas, terminas con 
                código espagueti y despliegues rotos. Este es mi flujo:
              </p>
              
              {/* Architecture Diagram */}
              <div className="mb-8">
                <img 
                  src={architectureDiagram} 
                  alt="Diagrama de arquitectura actual" 
                  className="w-full rounded-xl border border-gray-200 shadow-sm"
                />
              </div>
              
              <WorkflowTimeline
                steps={[
                  {
                    title: 'Vibecoding en Lovable',
                    description: 'Todo el desarrollo activo ocurre aquí. Cada prompt genera un commit automático.',
                  },
                  {
                    title: 'Control de Ramas',
                    description: (
                      <>
                        <p className="mb-2">Uso una estrategia de dos ramas principales:</p>
                        <BranchDiagram />
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>
                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">release</code>: 
                            Conectada a{' '}
                            <a 
                              href="https://building.vibecoders.la" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              building.vibecoders.la
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {' '}(staging para QA).
                          </li>
                          <li>
                            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">main</code>: 
                            Conectada a{' '}
                            <a 
                              href="https://vibecoders.la" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              vibecoders.la
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {' '}(producción).
                          </li>
                        </ul>
                      </>
                    ),
                  },
                  {
                    title: 'Antigravity: El Flujo de Merge',
                    description: 'Cuando una feature está lista en release, la subo a main con un PR. Vercel detecta el cambio y despliega automáticamente.',
                  },
                ]}
              />
            </section>

            {/* Section: Diseño con IA */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Diseño con IA: Cómo no parecer "una web hecha por IA"
              </h2>
              <p className="text-gray-600 mb-6">
                Este es el secreto mejor guardado. La IA genera código funcional, pero el diseño por defecto 
                grita "plantilla genérica". Aquí están mis 3 reglas de oro:
              </p>
              
              <div className="space-y-4">
                <ProTipCallout variant="warning" title="Regla #1: CERO Emojis">
                  Los emojis son el sello de las apps generadas por IA. En vibecoders.la, prohibí su uso y los 
                  reemplacé por iconos de Lucide React. El resultado es una estética más limpia y profesional.
                </ProTipCallout>
                
                <ProTipCallout variant="info" title="Regla #2: Fuentes con personalidad">
                  <p>
                    Nunca uses la fuente por defecto. Elegí una fuente variable personalizada (Camera Plain) que 
                    le da identidad única a la marca. Una tipografía distintiva separa tu proyecto del resto. 
                    Explora opciones en{' '}
                    <a 
                      href="https://fonts.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Google Fonts
                      <ExternalLink className="h-3 w-3" />
                    </a>.
                  </p>
                </ProTipCallout>
                
                <ProTipCallout variant="success" title='Regla #3: Copiar como un artista (Branding)'>
                  <p>
                    No reinventes la rueda del diseño. Usé{' '}
                    <a 
                      href="https://firecrawl.dev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      firecrawl.dev
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {' '}para extraer paletas de color y estilos de sitios que admiro. Luego los adapté 
                    a mi propia visión. La inspiración estructurada acelera todo.
                  </p>
                </ProTipCallout>
              </div>
            </section>

            {/* Section: Optimización de Costos */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Optimización de Costos (El tip Senior)
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Lovable es increíble para iterar rápido, pero tiene límites de uso. Mi estrategia: uso Lovable 
                para el 80% del desarrollo inicial y las iteraciones de UI. Para cambios quirúrgicos o refactoring 
                pesado, abro{' '}
                <a 
                  href="https://antigravity.google/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Antigravity
                  <ExternalLink className="h-3 w-3" />
                </a>
                {' '}(un IDE con IA integrada) conectado al mismo repo. Así maximizo mis créditos 
                de Lovable para lo que mejor hace: generar y diseñar rápido.
              </p>
            </section>

            {/* Conclusion */}
            <section className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Ser un Vibecoder no es solo saber promptear. Es entender arquitectura, flujos de trabajo y 
                principios de diseño. Las herramientas son el vehículo, pero la estrategia es lo que te lleva 
                a producción de verdad.
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
