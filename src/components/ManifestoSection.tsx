const ManifestoSection = () => {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl">
        <div 
          className="animate-fade-in rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm opacity-0 md:p-12 lg:p-16"
          style={{ animationDelay: '0.55s' }}
        >
          {/* Eyebrow */}
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/50">
            Nuestra Filosofía
          </p>

          {/* Title with gradient */}
          <h2 className="mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-2xl font-bold text-transparent md:text-3xl lg:text-4xl">
            Minimum Vibeable Product (MVP)
          </h2>

          {/* Body text */}
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            "El código se ha vuelto un commodity. La visión es el único activo escaso. No construimos para llenar requisitos. Construimos para provocar una reacción."
          </p>
        </div>
      </div>
    </section>
  );
};

export default ManifestoSection;
