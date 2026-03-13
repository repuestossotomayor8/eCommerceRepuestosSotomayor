import heroImage from "@/assets/hero-workshop.jpg";

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden md:min-h-[70vh]">
      {/* Background */}
      <img
        src={heroImage}
        alt="Taller mecánico"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-surface-dark/75" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-display text-4xl font-black uppercase italic leading-tight tracking-tight text-primary-foreground sm:text-5xl md:text-7xl">
          Tu seguridad{" "}
          <span className="text-secondary">es lo primero</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-base text-surface-dark-foreground/80 md:text-lg">
          Más que repuestos, somos tranquilidad para tu bolsillo. Encuentra la pieza exacta para tu vehículo.
        </p>
        <a
          href="#productos"
          className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 md:text-base"
        >
          Ver Catálogo Completo
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
