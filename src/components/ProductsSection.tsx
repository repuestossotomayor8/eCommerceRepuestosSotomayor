import ProductCard from "./ProductCard";
import { supabase } from "@/lib/supabase/client";
import { SearchX, ChevronLeft, ChevronRight, Search, SlidersHorizontal, ChevronRight as BreadcrumbArrow } from "lucide-react";
import NextLink from "next/link";
import SortDropdown from "./SortDropdown";

type Props = {
  searchQuery?: string;
  page?: number;
  categoria?: string;
  marca?: string;
  sort?: string;
};

const ProductsSection = async ({ searchQuery = "", page = 1, categoria, marca, sort = "relevance" }: Props) => {
  const itemsPerPage = 12;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let products: any[] | null = null;
  let count: number | null = 0;

  // Try smart search RPC first (accent-insensitive + fuzzy)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("catalog_search", {
      search_term: searchQuery || "",
      category_filter: categoria || null,
      brand_filter: marca || null,
      sort_by: sort,
      page_num: page,
      page_size: itemsPerPage,
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      // RPC returns total_count in each row
      count = Number(rpcData[0].total_count) || 0;
      products = rpcData.map((r: Record<string, unknown>) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: r.price,
        image_url: r.image_url,
        image_2: r.image_2,
        code_1: r.code_1,
        code_2: r.code_2,
        categories: { name: r.category_name },
        brands: { name: r.brand_name, image_url: r.brand_image_url },
        specifications: r.specifications,
      }));
    } else if (!rpcError && rpcData && rpcData.length === 0) {
      products = [];
      count = 0;
    } else {
      throw new Error("RPC not available");
    }
  } catch {
    // Fallback: basic ILIKE search
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from("products")
      .select("*, categories!inner(name), brands!inner(name, image_url), specifications", { count: 'exact' })
      .range(from, to);

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,code_1.ilike.%${searchQuery}%,code_2.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (categoria) {
      query = query.eq("categories.name", categoria);
    }
    if (marca) {
      query = query.eq("brands.name", marca);
    }

    if (sort === "lowest_price") {
      query = query.order("price", { ascending: true });
    } else if (sort === "highest_price") {
      query = query.order("price", { ascending: false });
    } else if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const result = await query;
    products = result.data;
    count = result.count;
  }

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;
  
  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (categoria) params.set("categoria", categoria);
    if (marca) params.set("marca", marca);
    if (sort !== "relevance") params.set("sort", sort);
    params.set("page", newPage.toString());
    return `/catalogo?${params.toString()}#productos`;
  };
  
  const RELATED_KEYWORDS = ["Amortiguador", "Meseta", "Terminal", "Bomba", "Filtro", "Bujía"];

  return (
    <section id="productos" className="w-full">
      <div className="w-full mb-6">
        {/* Breadcrumbs - hidden on mobile */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <span>Inicio</span>
          <BreadcrumbArrow className="w-3 h-3" />
          <span>Repuestos</span>
          {categoria && (
            <>
              <BreadcrumbArrow className="w-3 h-3" />
              <span className="text-slate-800 font-bold">{categoria}</span>
            </>
          )}
          {marca && (
            <>
              <BreadcrumbArrow className="w-3 h-3" />
              <span className="text-slate-800">{marca}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 md:pb-4">
          <div className="min-w-0">
            {searchQuery ? (
              <>
                <h2 className="font-display text-lg font-black uppercase text-foreground md:text-3xl truncate">
                  {categoria ? `${categoria} ` : ''}Resultados: <span className="text-primary tracking-tight">"{searchQuery}"</span>
                </h2>
                <div className="text-xs text-muted-foreground mt-0.5 md:mt-2 md:text-sm">
                  {count === 0
                    ? "Ningún producto encontrado."
                    : (count === 1 ? "1 resultado." : `${count} resultados.`)}
                </div>
              </>
            ) : (
              <h2 className="font-display text-lg font-black uppercase text-foreground md:text-3xl tracking-tight">
                {categoria ? categoria : (marca ? `Repuestos ${marca}` : "Catálogo")}
              </h2>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <SlidersHorizontal className="w-4 h-4 text-slate-500 hidden sm:block" />
             <SortDropdown currentSort={sort} />
          </div>
        </div>

        {/* Búsquedas Sugeridas */}
        {!categoria && !marca && (
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-hide pb-1 md:mt-4 md:gap-2 md:pb-2">
            <span className="text-[10px] text-slate-400 whitespace-nowrap hidden sm:inline md:text-xs">Sugeridas:</span>
            {RELATED_KEYWORDS.map(kw => (
               <NextLink key={kw} href={`/catalogo?q=${kw}`} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-medium whitespace-nowrap transition-colors">
                  {kw}
               </NextLink>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        {/* Mobile search bar — only visible below md */}
        <form method="GET" action="/catalogo" className="relative mt-4 md:hidden">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Buscar repuesto, marca o SKU..."
            className="w-full rounded-lg bg-background border border-border py-2.5 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border/50 transition-all focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-2 text-primary-foreground">
            <Search size={16} />
          </button>
        </form>
        {products && products.length > 0 ? (
          <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 md:mt-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                category={product.categories?.name || "General"}
                name={product.name}
                price={product.price}
                image={product.image_url}
                image2={product.image_2}
                description={product.description}
                brand={product.brands?.name}
                brand_image={product.brands?.image_url}
                code_1={product.code_1}
                code_2={product.code_2}
                specifications={product.specifications}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {page > 1 ? (
                <NextLink href={createPageUrl(page - 1)} className="flex items-center gap-1 bg-background border px-4 py-2 rounded-md hover:bg-muted font-bold text-sm transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </NextLink>
              ) : (
                <button disabled className="flex items-center gap-1 bg-muted text-muted-foreground/50 border px-4 py-2 rounded-md font-bold text-sm">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
              )}
              
              <span className="text-sm font-medium mx-4 bg-muted/50 px-3 py-1.5 rounded text-foreground">
                Página {page} de {totalPages}
              </span>
              
              {page < totalPages ? (
                <NextLink href={createPageUrl(page + 1)} className="flex items-center gap-1 bg-background border px-4 py-2 rounded-md hover:bg-muted font-bold text-sm transition-colors">
                   Siguiente <ChevronRight className="w-4 h-4" />
                </NextLink>
              ) : (
                <button disabled className="flex items-center gap-1 bg-muted text-muted-foreground/50 border px-4 py-2 rounded-md font-bold text-sm">
                   Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </>
        ) : (
          <div className="mt-12 flex flex-col items-center justify-center text-center p-8 bg-background border border-border/50 rounded-xl shadow-sm">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground/50">
               <SearchX size={32} />
            </div>
            <h3 className="text-xl font-bold text-foreground">No encontramos nada...</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">No hay productos que coincidan con tu búsqueda actual. Intenta utilizar términos más generales.</p>
            <a href="/catalogo" className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90 transition-colors uppercase text-sm tracking-wider">
              Ver todo el catálogo
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
