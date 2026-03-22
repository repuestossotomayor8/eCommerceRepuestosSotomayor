"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useBcvStore } from "@/lib/store/bcvStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProductCardProps {
  id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  image2?: string;
  description?: string;
  brand?: string;
  code_1?: string;
  code_2?: string;
}

const ProductCard = ({ id, category, name, price, image, image2, description, brand, code_1, code_2 }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const bcvRate = useBcvStore((state) => state.rate);
  const [isOpen, setIsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(image);

  const handleAddToCart = () => {
    addItem({ id, category, name, price, image });
    toast.success("Producto añadido", {
      description: `${name} ha sido añadido al carrito.`,
    });
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer" onClick={() => setActiveImage(image)}>
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
        </DialogTrigger>

        {/* Info */}
        <div className="flex flex-1 flex-col p-3 md:p-4">
          <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
            {category}
          </span>
          <DialogTrigger asChild>
            <h3 
              className="mt-1 cursor-pointer line-clamp-2 font-display text-xs font-bold leading-tight text-foreground md:text-sm hover:text-primary transition-colors"
              onClick={() => setActiveImage(image)}
            >
              {name}
            </h3>
          </DialogTrigger>
          <div className="mt-auto flex items-end justify-between pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-lg font-black tracking-tight text-primary md:text-xl">
                ${(price * 1.6).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Precio Tasa BCV</span>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 rounded-md border-2 border-primary px-2.5 py-1.5 font-display text-xs font-bold uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground md:px-3">
              <ShoppingCart size={14} />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          </div>
        </div>

        {/* Modal Quick View */}
        <DialogContent className="sm:max-w-[800px] overflow-hidden gap-0 p-0 rounded-xl">
          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Left side: Images gallery */}
            <div className="w-full md:w-1/2 bg-surface-dark/5 p-6 flex flex-col justify-center items-center relative gap-6">
              <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-lg bg-white shadow-sm border">
                <img src={activeImage} alt={name} className="h-full w-full object-contain p-4" />
              </div>
              
              {/* Thumbnail selector if there's a second image */}
              {image2 && (
                <div className="flex gap-3 justify-center">
                  <button 
                    className={`h-16 w-16 overflow-hidden bg-white rounded-md border-2 transition-all ${activeImage === image ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100 hover:border-primary/50'}`}
                    onClick={() => setActiveImage(image)}
                  >
                    <img src={image} className="h-full w-full object-contain p-1" />
                  </button>
                  <button 
                    className={`h-16 w-16 overflow-hidden bg-white rounded-md border-2 transition-all ${activeImage === image2 ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100 hover:border-primary/50'}`}
                    onClick={() => setActiveImage(image2)}
                  >
                    <img src={image2} className="h-full w-full object-contain p-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Right side: Product details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
              <DialogHeader className="mb-4 text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{category}</p>
                <DialogTitle className="text-2xl md:text-3xl font-black font-display leading-tight">{name}</DialogTitle>
                
                {/* Brand & Codes Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {brand && <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground ring-1 ring-inset ring-border uppercase tracking-wider">Marca: <span className="text-foreground ml-1">{brand}</span></span>}
                  {code_1 && <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground ring-1 ring-inset ring-border font-mono uppercase">Cod 1: <span className="text-foreground ml-1">{code_1}</span></span>}
                  {code_2 && <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground ring-1 ring-inset ring-border font-mono uppercase">Cod 2: <span className="text-foreground ml-1">{code_2}</span></span>}
                </div>

                <div className="mt-5 mb-1 pt-4 border-t border-border flex justify-end">
                   <a 
                     href={`/producto/${id}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded"
                   >
                     Ver página completa
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                   </a>
                </div>

                <DialogDescription className="text-foreground/80 break-words mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {description || "No hay descripción detallada disponible para este repuesto en este momento."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-auto pt-8 border-t border-border">
                 {/* Main BCV price */}
                 <div className="flex flex-col mb-4 gap-1">
                    <span className="font-display text-3xl font-black tracking-tight text-primary flex items-center">
                      ${(price * 1.6).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Precio Tasa BCV</span>
                    {bcvRate && (
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1 bg-muted w-fit px-2 py-1 rounded">
                        Ref. Bs: {(price * 1.6 * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    )}
                 </div>

                 {/* Discount callout for divisas */}
                 <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                   <span className="text-lg mt-0.5">⚡</span>
                   <div>
                     <p className="text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400">¡Descuento pagando en Divisas!</p>
                     <p className="text-xs text-muted-foreground mt-0.5">Paga en USDT, Zelle o $ efectivo y obtén este repuesto por:</p>
                     <p className="mt-1 font-display text-xl font-black text-green-600 dark:text-green-500">
                       ${price.toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span className="text-sm font-bold opacity-70">USD</span>
                     </p>
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                     handleAddToCart();
                     setIsOpen(false);
                   }}
                   className="w-full flex justify-center items-center gap-2 rounded-md bg-primary py-3.5 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                 >
                   <ShoppingCart size={20} />
                   Añadir al Carrito de Cotización
                 </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCard;
