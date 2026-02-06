import { useTranslation } from '@/hooks/useTranslation';
import BrowserUrlMock from './bento/BrowserUrlMock';
import TechStackCarousel from './bento/TechStackCarousel';
import EcosystemHub from './bento/EcosystemHub';
import VerifiedBadge from './bento/VerifiedBadge';

const BentoGrid = () => {
  const t = useTranslation('hero');

  const features = [
    {
      id: 'url',
      visual: <BrowserUrlMock />,
      title: t.bento?.url?.title || 'Your URL is your personal brand',
      body: t.bento?.url?.body || '',
    },
    {
      id: 'stack',
      visual: <TechStackCarousel />,
      title: t.bento?.stack?.title || 'Your Stack is your superpower',
      body: t.bento?.stack?.body || '',
    },
    {
      id: 'ecosystem',
      visual: <EcosystemHub />,
      title: t.bento?.ecosystem?.title || 'Connect your digital ecosystem',
      body: t.bento?.ecosystem?.body || '',
    },
    {
      id: 'reputation',
      visual: <VerifiedBadge />,
      title: t.bento?.reputation?.title || 'Validate yourself as a "Shipper"',
      body: t.bento?.reputation?.body || '',
    },
  ];

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
