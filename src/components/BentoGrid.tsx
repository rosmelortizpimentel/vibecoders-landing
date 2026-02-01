import BrowserUrlMock from './bento/BrowserUrlMock';
import TechStackCarousel from './bento/TechStackCarousel';
import EcosystemHub from './bento/EcosystemHub';
import VerifiedBadge from './bento/VerifiedBadge';

const features = [
  {
    id: 'url',
    visual: <BrowserUrlMock />,
    title: 'Tu URL es tu marca personal',
    body: 'Olvídate de los links genéricos. Tu nombre de usuario se convierte en tu carta de presentación digital. Una dirección web propia que te otorga identidad y profesionalismo inmediato, lista para compartir.',
  },
  {
    id: 'stack',
    visual: <TechStackCarousel />,
    title: 'Tu Stack es tu superpoder',
    body: 'No escondas la magia. Muestra con orgullo las herramientas que dominas (Lovable, v0, Replit). La transparencia demuestra que estás a la vanguardia.',
  },
  {
    id: 'ecosystem',
    visual: <EcosystemHub />,
    title: 'Conecta tu ecosistema digital',
    body: 'Tu código vive en GitHub. Tu red en LinkedIn. Tu voz en X. Vibecoders es el punto de encuentro donde todo tu caos creativo cobra sentido.',
  },
  {
    id: 'reputation',
    visual: <VerifiedBadge />,
    title: 'Valídate como "Shipper"',
    body: 'Sepárate de los que solo tienen ideas. Un perfil verificado con proyectos funcionales le dice al mundo: "Yo no solo prometo, yo construyo".',
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
