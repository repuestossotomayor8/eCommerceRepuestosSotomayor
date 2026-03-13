import { Cog, CircleDot, Car, Disc3, GitFork, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  name: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  { name: "Motor", icon: Cog },
  { name: "Tren Delantero", icon: Car },
  { name: "Suspensión", icon: GitFork },
  { name: "Frenos", icon: Disc3 },
  { name: "Transmisión", icon: CircleDot },
  { name: "Accesorios", icon: Wrench },
];

const CategoriesSection = () => {
  return (
    <section id="categorias" className="py-16">
      <div className="container mx-auto">
        <h2 className="font-display text-2xl font-black uppercase italic tracking-tight text-foreground md:text-3xl">
          Categorías <span className="text-primary">Destacadas</span>
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
            >
              <cat.icon
                size={36}
                className="text-muted-foreground transition-colors group-hover:text-primary"
              />
              <span className="font-display text-xs font-bold uppercase tracking-wide text-foreground">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
