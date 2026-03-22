"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useBcvStore } from "@/lib/store/bcvStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function CartSheet({ children }: { children: React.ReactNode }) {
  const { items, removeItem, updateQuantity, getCartTotal, getCartItemsCount } = useCartStore();
  const bcvRate = useBcvStore((state) => state.rate);

  const getSubtotalEfectivo = () => getCartTotal();
  const getSubtotalBcvUsd = () => getCartTotal() * 1.6;

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "584144416287"; // Número Sotomayor
    let message = "¡Hola *Repuestos Sotomayor*! 👋 Quisiera procesar el siguiente pedido:\n\n";
    message += "🛒 *DETALLE DE COMPRA*\n──────────────────\n";

    items.forEach((item) => {
      let calcBcv = item.product.price * 1.6;
      let efec = (item.product.price * item.quantity).toFixed(2);
      let pto = (calcBcv * item.quantity).toFixed(2);
      
      message += `🔸 *${item.quantity}x ${item.product.name}*\n`;
      message += `   💵 Efectivo: *$${efec}*\n`;
      message += `   💳 Punto/Pago Móvil: *$${pto}*`;
      if (bcvRate) message += ` (Aprox Bs. ${(calcBcv * item.quantity * bcvRate).toFixed(2)})`;
      message += `\n\n`;
    });

    message += `──────────────────\n`;
    message += `📝 *RESUMEN TOTAL*\n`;
    message += `💰 *Si pago en Efectivo:* $${getSubtotalEfectivo().toFixed(2)}\n`;
    message += `💳 *Si pago con Tasa BCV:* $${getSubtotalBcvUsd().toFixed(2)}`;
    
    if (bcvRate) {
      message += `\n(Referencia en Bs: ${(getSubtotalBcvUsd() * bcvRate).toFixed(2)})`;
    }
    
    message += `\n\nPor favor confírmenme disponibilidad y métodos de pago. ¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg overflow-hidden">
        <SheetHeader className="space-y-2.5">
          <SheetTitle>Tu Carrito ({getCartItemsCount()})</SheetTitle>
          <SheetDescription>
            Revisa los artículos que has añadido antes de proceder al pago.
          </SheetDescription>
          <Separator />
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-2">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <span className="text-lg font-medium text-muted-foreground">El carrito está vacío</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {items.map((item) => (
                <div key={item.product.id} className="flex space-x-4">
                  <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded">
                    <img
                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                      src={item.product.image}
                      alt={item.product.name}
                      className="absolute object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex flex-1 justify-between space-x-4">
                      <div className="space-y-1">
                        <h3 className="line-clamp-1 text-sm font-medium">{item.product.name}</h3>
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {item.product.category}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-medium text-green-600 dark:text-green-500 flex flex-col items-end leading-none">
                          <span className="text-[9px] uppercase tracking-widest opacity-70">Efectivo</span>
                          $ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs font-bold text-primary flex flex-col items-end leading-none">
                          <span className="text-[9px] uppercase tracking-widest opacity-70">Tasa BCV</span>
                          $ {(item.product.price * 1.6 * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-l-md"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantity(item.product.id, item.quantity - 1);
                            }
                          }}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Disminuir cantidad</span>
                        </Button>
                        <span className="flex w-8 items-center justify-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none rounded-r-md"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Incrementar cantidad</span>
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Separator />
          <Separator />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center bg-green-500/10 p-2 rounded-md border border-green-500/20">
               <span className="font-bold text-green-700 dark:text-green-400">Total Efectivo</span>
               <span className="font-black text-lg text-green-600 dark:text-green-500">$ {getSubtotalEfectivo().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-start bg-primary/10 p-2 rounded-md border border-primary/20">
               <div className="flex flex-col">
                  <span className="font-bold text-primary">Total Tasa BCV</span>
                   <span className="text-xs text-muted-foreground mt-0.5">Si pagas por punto de venta o pago móvil.</span>
               </div>
               <div className="text-right">
                 <span className="font-black text-lg text-primary">$ {getSubtotalBcvUsd().toFixed(2)}</span>
                 {bcvRate && <div className="text-xs font-bold text-muted-foreground mt-0.5">Ref. Bs. {(getSubtotalBcvUsd() * bcvRate).toFixed(2)}</div>}
               </div>
            </div>
          </div>
          <Button
            className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white"
            size="lg"
            disabled={items.length === 0}
            onClick={handleWhatsAppCheckout}
          >
            Completar Pedido por WhatsApp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
