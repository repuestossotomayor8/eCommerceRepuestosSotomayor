import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contacto" className="w-full max-w-[100vw] overflow-hidden bg-surface-dark py-8 text-surface-dark-foreground md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Contact */}
          <div>
            <div className="mb-4">
              <img 
                src="/RepuestosSMsinfondo.png" 
                alt="Repuestos Sotomayor" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <ul className="mt-4 space-y-3 font-body text-sm text-surface-dark-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                Av. Padre Alfonzo Cruce con Av. Michelena. Edif. 90-64. Valencia.
              </li>
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span>0412-423-6129</span>
                  <span>0414-441-6287</span>
                </div>
              </li>
              <li className="flex items-center gap-2 text-wrap break-all">
                <Mail size={16} className="flex-shrink-0 text-primary" />
                repuestosotomayorca@gmail.com
              </li>
              <li className="flex items-start gap-2">
                <Clock size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                <div className="flex flex-col">
                  <span>Lunes a Viernes: 8:30 AM - 4:30 PM</span>
                  <span>Sábados: 8:30 AM - 2:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-surface-dark-foreground">
              Enlaces Rápidos
            </h4>
            <ul className="mt-4 space-y-2 font-body text-sm text-surface-dark-foreground/70">
              {["Inicio", "Catálogo", "Ofertas", "Nosotros", "Contacto"].map((link) => (
                <li key={link}>
                  <a href="#" className="transition-colors hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-surface-dark-foreground">
              Categorías Populares
            </h4>
            <ul className="mt-4 space-y-2 font-body text-sm text-surface-dark-foreground/70">
              {["Motor", "Suspensión", "Frenos", "Transmisión", "Tren Delantero"].map((cat) => (
                <li key={cat}>
                  <a href="#" className="transition-colors hover:text-primary">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-surface-dark-foreground/10 pt-6 text-center font-body text-xs text-surface-dark-foreground/50 md:mt-10">
          © {new Date().getFullYear()} Repuestos Sotomayor. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
