"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";

type SubCategory = { id: string; name: string };
type Props = {
  categories: SubCategory[];
  brands: SubCategory[];
};

export default function CatalogSidebar({ categories, brands }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false); // Control del cajón móvil

  const activeCategory = searchParams.get("categoria");
  const activeBrand = searchParams.get("marca");
  const activeSort = searchParams.get("sort");
  const searchQuery = searchParams.get("q");

  // Evitar scroll en el fondo cuando el modal móvil está abierto
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Constructor dinámico de la URL con los `searchParams` nativos
  const buildUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Toda vez que filtremos, volvemos a la página 1 para no caer en un rango fantasma
    params.delete("page");
    return `${pathname}?${params.toString()}`;
  };

  const handleAction = (key: string, value: string | null, isActive: boolean) => {
    const finalVal = isActive ? null : value;
    router.push(buildUrl(key, finalVal));
    
    // Auto-cerrar el panel en móvil si hace un touch (pero dejar la transición ocurrir)
    if (window.innerWidth < 768) {
      setTimeout(() => setIsOpen(false), 200);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col gap-8 h-full overflow-y-auto pb-24 md:pb-0 scrollbar-hide">
      
      {/* Cabecera Mobile */}
      <div className="md:hidden flex items-center justify-between pb-4 border-b">
        <h3 className="font-display font-black text-xl uppercase tracking-tight flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" /> Filtros
        </h3>
        <button className="p-2 bg-slate-100 rounded-full hover:bg-slate-200" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Bloque Categorías */}
      <div>
        <h4 className="font-bold text-slate-800 mb-4 px-1 uppercase tracking-wider text-xs">Categorías</h4>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => handleAction("categoria", cat.name, isActive)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-primary border-primary" : "border-slate-300 bg-white"}`}>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm truncate leading-none">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloque Marcas */}
      <div>
        <h4 className="font-bold text-slate-800 mb-4 px-1 uppercase tracking-wider text-xs">Marcas Originales</h4>
        <div className="space-y-1.5">
          {brands.map((brand) => {
            const isActive = activeBrand === brand.name;
            return (
              <button
                key={brand.id}
                onClick={() => handleAction("marca", brand.name, isActive)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? "bg-primary/10 text-primary font-bold shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-primary border-primary" : "border-slate-300 bg-white"}`}>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm truncate leading-none uppercase">{brand.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Limpieza Global */}
      {(activeCategory || activeBrand || activeSort) && (
        <button
          onClick={() => {
            router.push(pathname + (searchQuery ? `?q=${searchQuery}` : ""));
            if (window.innerWidth < 768) setIsOpen(false);
          }}
          className="mt-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 px-4 py-2.5 rounded-lg transition-colors border border-slate-200"
        >
          Borrar Filtros (×)
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Botón Flotante (Solo Mobile) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 border-2 border-slate-800 text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] font-black uppercase text-sm px-6 py-3.5 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Filter className="w-4 h-4" /> 
          <span>Filtrar</span>
          {(activeBrand || activeCategory) && (
             <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs ml-1 font-bold">
               {(activeBrand ? 1 : 0) + (activeCategory ? 1 : 0)}
             </span>
          )}
        </button>
      </div>

      {/* Modal / Menú Lateral Desplegable (Solo Mobile) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Capa borrosa oscura atrá de modal */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="relative w-[320px] max-w-[85vw] h-full bg-white shadow-2xl p-6 border-r border-slate-200 animate-[slide-in-left_0.2s_ease-out]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Columna Anclada Izquierda (Solo Desktop) */}
      <aside className="hidden md:block w-[260px] shrink-0 sticky top-24 self-start bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6">
        <SidebarContent />
      </aside>
    </>
  );
}
