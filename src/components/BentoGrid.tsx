import BrowserUrlMock from './bento/BrowserUrlMock';
import TechStackCarousel from './bento/TechStackCarousel';
import EcosystemHub from './bento/EcosystemHub';
import VerifiedBadge from './bento/VerifiedBadge';

const features = [
  {
    id: 'url',
    visual: <BrowserUrlMock />,
    title: 'Asegura tu @username',
    body: 'Los mejores nombres vuelan rápido. Reclama tu identidad única antes de que alguien más se la lleve. Es tu nueva tarjeta de presentación.',
  },
  {
    id: 'stack',
    visual: <TechStackCarousel />,
    title: 'Presume tu "Killer Combo"',
    body: 'Una captura no dice nada. Revela tu receta secreta: v0 + Supabase + Cursor. Demuestra que no solo copias código, sino que dominas el stack moderno.',
  },
  {
    id: 'ecosystem',
    visual: <EcosystemHub />,
    title: 'El fin del caos',
    body: 'Tu código vive en GitHub. Tu red en LinkedIn. Tus demos en Vercel. Vibecoders es el pegamento que une todo tu caos creativo en un solo lugar.',
  },
  {
    id: 'reputation',
    visual: <VerifiedBadge />,
    title: 'Demuestra que eres Builder',
    body: 'Sepárate de los que solo escriben prompts. Un perfil verificado con proyectos funcionales vale más que mil currículums. Muestra resultados, cierra tratos.',
  },
];

const BentoGrid = () => {
  return (
    <section className="bg-[#F6F5F4] py-20 px-4 md:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Visual Component - Fixed height for alignment */}
              <div className="h-44 flex items-center justify-center mb-5">
                {feature.visual}
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-stone-900">
                {feature.title}
              </h3>

              {/* Body */}
              <p className="text-stone-600 leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
