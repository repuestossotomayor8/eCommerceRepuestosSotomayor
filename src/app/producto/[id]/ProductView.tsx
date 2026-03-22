"use client";

import { useState } from "react";
import { Link, ShoppingCart, ArrowLeft, Share2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useBcvStore } from "@/lib/store/bcvStore";
import { toast } from "sonner";
import NextLink from "next/link";

interface ProductViewProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    image_2: string;
    code_1: string;
    code_2: string;
    categories: { name: string };
    brands: { name: string };
  }
}

export default function ProductView({ product }: ProductViewProps) {
  const [activeImage, setActiveImage] = useState(product.image_url);
  const addItem = useCartStore((state) => state.addItem);
  const bcvRate = useBcvStore((state) => state.rate);

  const handleAddToCart = () => {
    addItem({ 
      id: product.id, 
      category: product.categories?.name || "General", 
      name: product.name, 
      price: product.price, 
      image: product.image_url 
    });
    toast.success("Producto añadido", {
      description: `${product.name} ha sido añadido al carrito.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Mira este repuesto: ${product.name}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado", { description: "URL del producto copiada al portapapeles." });
    }
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden border border-border/50 shadow-sm max-w-5xl mx-auto my-8 md:my-12">
      <div className="flex justify-between items-center p-4 border-b">
         <NextLink href="/#productos" className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Volver al catálogo
         </NextLink>
         <button onClick={handleShare} className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-md">
            <Share2 className="w-4 h-4" />
            Compartir
         </button>
      </div>
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left side: Images gallery */}
        <div className="w-full md:w-1/2 bg-surface-dark/5 p-8 flex flex-col justify-center items-center relative gap-8">
          <div className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-xl bg-white shadow-md border">
            <img src={activeImage} alt={product.name} className="h-full w-full object-contain p-6" />
          </div>
          
          {/* Thumbnail selector if there's a second image */}
          {product.image_2 && (
            <div className="flex gap-4 justify-center">
              <button 
                className={`h-20 w-20 overflow-hidden bg-white rounded-md border-2 transition-all ${activeImage === product.image_url ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100 hover:border-primary/50'}`}
                onClick={() => setActiveImage(product.image_url)}
              >
                <img src={product.image_url} className="h-full w-full object-contain p-1.5" />
              </button>
              <button 
                className={`h-20 w-20 overflow-hidden bg-white rounded-md border-2 transition-all ${activeImage === product.image_2 ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100 hover:border-primary/50'}`}
                onClick={() => setActiveImage(product.image_2)}
              >
                <img src={product.image_2} className="h-full w-full object-contain p-1.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right side: Product details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="mb-6 text-left">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">{product.categories?.name || "Categoría General"}</p>
            <h1 className="text-3xl md:text-4xl font-black font-display leading-[1.1] text-foreground">{product.name}</h1>
            
            {/* Brand & Codes Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {product.brands?.name && <span className="inline-flex items-center rounded-md bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground ring-1 ring-inset ring-border uppercase tracking-wider">Marca: <span className="text-foreground ml-1.5">{product.brands.name}</span></span>}
              {product.code_1 && <span className="inline-flex items-center rounded-md bg-muted px-3 py-1.5 text-[11px] font-bold text-muted-foreground ring-1 ring-inset ring-border font-mono uppercase">Cod 1: <span className="text-foreground ml-1.5">{product.code_1}</span></span>}
              {product.code_2 && <span className="inline-flex items-center rounded-md bg-muted px-3 py-1.5 text-[11px] font-bold text-muted-foreground ring-1 ring-inset ring-border font-mono uppercase">Cod 2: <span className="text-foreground ml-1.5">{product.code_2}</span></span>}
            </div>

            <p className="text-foreground/80 break-words mt-6 text-sm md:text-base leading-relaxed whitespace-pre-wrap bg-surface-dark/5 p-4 rounded-lg">
              {product.description || "No hay descripción detallada disponible para este repuesto en este momento."}
            </p>
          </div>
          
          <div className="mt-auto pt-8 border-t border-border">
             {/* Main BCV price */}
             <div className="flex flex-col mb-5 gap-1">
                <span className="font-display text-4xl font-black tracking-tight text-primary">
                  ${(product.price * 1.6).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Precio Tasa BCV</span>
                {bcvRate && (
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-2 bg-muted w-fit px-3 py-1.5 rounded-md">
                    Ref. Bs: {(product.price * 1.6 * bcvRate).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </span>
                )}
             </div>

             {/* Discount callout for divisas */}
             <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
               <span className="text-2xl">⚡</span>
               <div>
                 <p className="text-sm font-black uppercase tracking-wider text-green-700 dark:text-green-400">¡Descuento pagando en Divisas!</p>
                 <p className="text-sm text-muted-foreground mt-1">Paga en USDT, Zelle o $ efectivo y obtén este repuesto por solo:</p>
                 <p className="mt-2 font-display text-3xl font-black text-green-600 dark:text-green-500">
                   ${product.price.toLocaleString("es-VE", { minimumFractionDigits: 2 })} <span className="text-base font-bold opacity-70">USD</span>
                 </p>
               </div>
             </div>

             <button 
               onClick={handleAddToCart}
               className="w-full flex justify-center items-center gap-2 rounded-lg bg-primary py-4 font-display text-sm md:text-base font-bold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5"
             >
               <ShoppingCart size={22} />
               Añadir al Carrito de Cotización
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
