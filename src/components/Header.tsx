import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = 3;

  return (
    <header className="sticky top-0 z-50 bg-surface-dark shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4 py-3">
        {/* Logo */}
        <a href="/" className="flex-shrink-0 font-display">
          <span className="text-xl font-black uppercase italic tracking-tight text-primary-foreground md:text-2xl">
            Repuestos{" "}
            <span className="text-primary">Sotomayor</span>
          </span>
        </a>

        {/* Search Bar - Desktop */}
        <div className="relative hidden flex-1 max-w-2xl md:block">
          <input
            type="text"
            placeholder="Buscar repuesto, marca o SKU..."
            className="w-full rounded-md bg-surface-dark-foreground/10 py-2.5 pl-4 pr-12 font-body text-sm text-surface-dark-foreground placeholder:text-surface-dark-foreground/50 outline-none ring-1 ring-surface-dark-foreground/20 transition-all focus:ring-2 focus:ring-primary"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
            <Search size={18} />
          </button>
        </div>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-3">
          <button className="relative text-surface-dark-foreground transition-colors hover:text-primary">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="text-surface-dark-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {mobileMenuOpen && (
        <div className="border-t border-surface-dark-foreground/10 px-4 pb-4 md:hidden">
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Buscar repuesto, marca o SKU..."
              className="w-full rounded-md bg-surface-dark-foreground/10 py-2.5 pl-4 pr-12 font-body text-sm text-surface-dark-foreground placeholder:text-surface-dark-foreground/50 outline-none ring-1 ring-surface-dark-foreground/20 focus:ring-2 focus:ring-primary"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2 text-primary-foreground">
              <Search size={18} />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-2 font-display text-sm font-bold uppercase text-surface-dark-foreground">
            <a href="#" className="py-2 transition-colors hover:text-primary">Inicio</a>
            <a href="#categorias" className="py-2 transition-colors hover:text-primary">Categorías</a>
            <a href="#productos" className="py-2 transition-colors hover:text-primary">Productos</a>
            <a href="#contacto" className="py-2 transition-colors hover:text-primary">Contacto</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
