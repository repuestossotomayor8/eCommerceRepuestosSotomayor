import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contacto" className="bg-surface-dark py-12 text-surface-dark-foreground">
      <div className="container mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-black uppercase italic text-primary">
              Repuestos Sotomayor
            </h3>
            <ul className="mt-4 space-y-3 font-body text-sm text-surface-dark-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                Valencia, Estado Carabobo, Venezuela
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-primary" />
                +58 241-XXX-XXXX
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-primary" />
                info@repuestossotomayor.com
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="flex-shrink-0 text-primary" />
                Lun - Sáb: 8:00 AM - 5:00 PM
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

        <div className="mt-10 border-t border-surface-dark-foreground/10 pt-6 text-center font-body text-xs text-surface-dark-foreground/50">
          © {new Date().getFullYear()} Repuestos Sotomayor. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
