import { Layers, Code2, Timer, Briefcase } from 'lucide-react';

const features = [
  {
    icon: Layers,
    iconColor: 'text-coral-500',
    iconBg: 'bg-coral-50',
    title: 'Tu Galería Centralizada',
    body: 'Olvídate de tener tus proyectos perdidos. Crea tu perfil único y organiza todos tus deploys en una vitrina visual diseñada para impresionar.',
    link: 'Ver ejemplo →',
  },
  {
    icon: Code2,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    title: 'Stack Transparente',
    body: 'Una captura no cuenta la historia. Declara tu receta: v0, Supabase, Cursor. Muestra exactamente cómo construiste tu solución.',
    link: 'Ver stacks →',
  },
  {
    icon: Timer,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    title: 'Proof of Speed',
    body: 'La velocidad es tu activo. Destaca tu \'Time-to-Build\' (ej. 4 horas) y demuestra que eres un builder de alto rendimiento.',
    link: 'Saber más →',
  },
  {
    icon: Briefcase,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-50',
    title: 'Reputación Profesional',
    body: 'Deja de enviar PDFs. Comparte tu enlace de Vibecoders para validar tus habilidades con proyectos funcionales, no con promesas.',
    link: 'Unirse ahora →',
  },
];

const BentoGrid = () => {
  return (
    <section className="bg-[#F6F5F4] py-20 px-4 md:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Section Title */}
        <h2 className="mb-12 text-center text-3xl font-bold text-stone-900 md:text-4xl lg:text-5xl">
          Todo lo que tu portafolio necesitaba.
        </h2>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-stone-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Icon */}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg}`}>
                  <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold text-stone-900">
                  {feature.title}
                </h3>

                {/* Body */}
                <p className="mb-4 text-stone-600 leading-relaxed">
                  {feature.body}
                </p>

                {/* Link */}
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-medium text-stone-900 transition-colors hover:text-stone-600"
                >
                  {feature.link}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
