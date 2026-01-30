import BrowserUrlMock from './bento/BrowserUrlMock';
import TechStackCarousel from './bento/TechStackCarousel';
import EcosystemHub from './bento/EcosystemHub';
import VerifiedBadge from './bento/VerifiedBadge';

const features = [
  {
    id: 'url',
    visual: <BrowserUrlMock />,
    title: 'Tu URL Oficial',
    body: 'Reclama tu nombre de usuario único. Un enlace limpio y profesional para compartir en tu bio de X o LinkedIn.',
  },
  {
    id: 'stack',
    visual: <TechStackCarousel />,
    title: 'Transparencia de Stack',
    body: 'No es magia, es ingeniería. Muestra los iconos de las herramientas exactas que usaste para construir cada proyecto.',
  },
  {
    id: 'ecosystem',
    visual: <EcosystemHub />,
    title: 'Conecta tu Ecosistema',
    body: 'Deja de fragmentar tu identidad. Integra tus repos de GitHub, LinkedIn y tus perfiles de builder en un solo dashboard central.',
  },
  {
    id: 'reputation',
    visual: <VerifiedBadge />,
    title: 'Reputación Profesional',
    body: 'Un portafolio visual listo para enviar a recruiters. Que te contraten por lo que has construido, no por un PDF.',
  },
];

const BentoGrid = () => {
  return (
    <section className="bg-[#F6F5F4] py-20 px-4 md:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2">
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
