import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  category: string;
  name: string;
  price: number;
  image: string;
}

const ProductCard = ({ category, name, price, image }: ProductCardProps) => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
          {category}
        </span>
        <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold text-foreground">
          {name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-display text-xl font-black text-primary">
            ${price.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
          </span>
          <button className="flex items-center gap-1.5 rounded-md border-2 border-primary px-3 py-1.5 font-display text-xs font-bold uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground">
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
