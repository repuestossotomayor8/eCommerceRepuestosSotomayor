import { MapPin, Clock, Phone, Navigation } from "lucide-react";

export default function LocationSection() {
  return (
    <section className="bg-slate-100 py-16 px-4 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-0 bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-200">
          
          {/* Tarjeta de Información Glassmorphism/Flat */}
          <div className="w-full md:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
            <h2 className="font-display text-3xl font-black uppercase text-slate-800 tracking-tight mb-8">
              Visita Nuestro <span className="text-primary italic">Almacén</span>
            </h2>
            
            <div className="space-y-8 text-slate-600">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3.5 rounded-full shrink-0">
                  <MapPin className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Dirección Principal</h4>
                  <p className="text-sm mt-1 leading-relaxed max-w-sm">
                    Avenida Padre Alfonzo Cruce con Avenida Michelena.
                    <br />Edif. 90-64. Sector la Candelaria. Valencia, Edo. Carabobo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3.5 rounded-full shrink-0">
                  <Clock className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Horario Laborable</h4>
                  <p className="text-sm mt-1 leading-relaxed">
                    Lunes a Viernes: 8:30 AM - 4:30 PM<br/>
                    Sábados: 8:30 AM - 2:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-whatsapp/10 p-3.5 rounded-full shrink-0">
                  <Phone className="text-whatsapp w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Contacto Directo</h4>
                  <p className="text-sm mt-1 leading-relaxed">
                    Teléfonos: 0412-423-6129 / 0414-441-6287<br/>
                    Correo: repuestosotomayorca@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <a href="https://maps.app.goo.gl/x5kdkXQe3iEPAZUX7" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors w-max shadow-md shadow-slate-900/20 group">
              <Navigation className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              Trazar ruta en el Mapa
            </a>
          </div>

          {/* Mapa Iframe */}
          <div className="w-full md:w-1/2 min-h-[400px] md:min-h-full relative bg-slate-200 overflow-hidden">
            {/* Mapa insertado en el fondo a pantalla dividida */}
            <iframe 
               src="https://maps.google.com/maps?q=Repuestos+Sotomayor+C.A.,+Valencia,+Carabobo&t=&z=16&ie=UTF8&iwloc=&output=embed" 
               className="absolute inset-0 w-full h-full border-0 filter contrast-125 saturate-50" 
               allowFullScreen={false} 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
