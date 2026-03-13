import ProductCard from "./ProductCard";

const products = [
  { category: "Suspensión", name: "Amortiguadores Monroe Delanteros", price: 45.99, image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop" },
  { category: "Frenos", name: "Pastillas de Freno Bosch Cerámicas", price: 32.50, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop" },
  { category: "Motor", name: "Filtro de Aceite Mann Premium W712", price: 8.99, image: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400&h=400&fit=crop" },
  { category: "Transmisión", name: "Kit de Embrague Valeo Completo", price: 120.00, image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop" },
  { category: "Tren Delantero", name: "Rótulas Inferiores Moog Reforzadas", price: 28.75, image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop" },
  { category: "Motor", name: "Correa de Distribución Gates PowerGrip", price: 55.00, image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop" },
  { category: "Frenos", name: "Disco de Freno Brembo Ventilado", price: 65.00, image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop" },
  { category: "Suspensión", name: "Espirales Delanteros Reforzados", price: 38.50, image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=400&fit=crop" },
];

const ProductsSection = () => {
  return (
    <section id="productos" className="bg-muted/50 py-16">
      <div className="container mx-auto">
        <h2 className="font-display text-2xl font-black uppercase italic tracking-tight text-foreground md:text-3xl">
          Productos <span className="text-primary">Destacados</span>
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
