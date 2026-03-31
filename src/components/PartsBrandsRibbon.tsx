"use client";

const PARTS_BRANDS = [
  { name: "MOOG", src: "https://cdn.worldvectorlogo.com/logos/moog-1.svg" },
  { name: "Bosch", src: "https://cdn.worldvectorlogo.com/logos/bosch-2.svg" },
  { name: "FEL-PRO", src: "https://cdn.worldvectorlogo.com/logos/fel-pro.svg" },
  { name: "Melling", src: "https://cdn.worldvectorlogo.com/logos/melling.svg" },
  { name: "Monroe", src: "https://cdn.worldvectorlogo.com/logos/monroe-1.svg" },
  { name: "Sealed Power", src: "https://cdn.worldvectorlogo.com/logos/sealed-power.svg" },
  { name: "LuK", src: "https://cdn.worldvectorlogo.com/logos/luk.svg" },
  { name: "Hastings", src: "https://cdn.worldvectorlogo.com/logos/hastings.svg" },
  { name: "Mann", src: "https://cdn.worldvectorlogo.com/logos/mann.svg" },
  { name: "TVA", src: "" },
];

export default function PartsBrandsRibbon() {
  const brands = PARTS_BRANDS.filter((b) => b.src); // Solo las que tienen logo

  const renderBrands = () =>
    brands.map((brand, i) => (
      <div
        key={i}
        className="flex shrink-0 items-center justify-center px-6 md:px-10"
      >
        <img
          src={brand.src}
          alt={brand.name}
          className="h-5 md:h-6 w-auto object-contain opacity-40 grayscale brightness-200 hover:opacity-80 hover:grayscale-0 hover:brightness-100 transition-all duration-300"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    ));

  return (
    <div className="w-full bg-slate-900 py-2.5 overflow-hidden flex border-b border-white/5">
      <div className="flex w-fit shrink-0 items-center animate-marquee-fast">
        {renderBrands()}
      </div>
      <div className="flex w-fit shrink-0 items-center animate-marquee-fast" aria-hidden="true">
        {renderBrands()}
      </div>
    </div>
  );
}
