import Header from "@/components/Header";
import ProductsSection from "@/components/ProductsSection";
import CatalogSidebar from "@/components/CatalogSidebar";
import { supabase } from "@/lib/supabase/client";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import DiscountBanner from "@/components/DiscountBanner";
import FloatingCartButton from "@/components/FloatingCartButton";
import PullToRefresh from "@/components/PullToRefresh";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Repuestos | Repuestos Sotomayor",
  description: "Explora nuestro catálogo completo de repuestos y autopartes. Precios en Tasa BCV y descuento pagando en divisas.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const CatalogoPage = async ({ searchParams }: Props) => {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === "string" ? resolvedParams.q : "";
  const pageStr = typeof resolvedParams?.page === "string" ? resolvedParams.page : "1";
  const page = parseInt(pageStr, 10) || 1;
  
  const categoria = typeof resolvedParams?.categoria === "string" ? resolvedParams.categoria : undefined;
  const marca = typeof resolvedParams?.marca === "string" ? resolvedParams.marca : undefined;
  const sort = typeof resolvedParams?.sort === "string" ? resolvedParams.sort : "relevance";

  // Pre-fetching de filtros para alimentar el menú lateral
  const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name");
  const { data: brandsData } = await supabase.from("brands").select("id, name").order("name");
  
  const categories = categoriesData || [];
  const brands = brandsData || [];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <PullToRefresh>
          <div className="container mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
            <CatalogSidebar categories={categories} brands={brands} />
            <div className="flex-1 w-full min-w-0">
              <ProductsSection 
                searchQuery={q} 
                page={page} 
                categoria={categoria}
                marca={marca}
                sort={sort}
              />
            </div>
          </div>
        </PullToRefresh>
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCartButton />
      <DiscountBanner />
    </div>
  );
};

export default CatalogoPage;
