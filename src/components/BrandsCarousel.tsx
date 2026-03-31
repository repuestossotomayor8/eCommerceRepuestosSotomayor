"use client";

import React from "react";
import Image from "next/image";

// URLs provisionales (Puedes cambiarlos luego por los oficiales SVG transparentes de cada marca)
const MARCAS = [
  { name: "Ford", src: "https://cdn.worldvectorlogo.com/logos/ford-1.svg", width: 130 },
  { name: "Chevrolet", src: "/marcas/chevrolet.png", width: 130 }, // Normalizado para tu futura imagen recortada
  { name: "Toyota", src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg", width: 120 },
  { name: "Jeep", src: "https://cdn.worldvectorlogo.com/logos/jeep-2.svg", width: 120 },
  { name: "Cummins", src: "https://cdn.worldvectorlogo.com/logos/cummins.svg", width: 140 },
  { name: "Isuzu", src: "https://cdn.worldvectorlogo.com/logos/isuzu.svg", width: 130 },
];

export default function BrandsCarousel() {
  // Duplicamos el array para que el scroll parezca infinito y sin saltos
  const renderLogos = () => {
    return MARCAS.map((marca, i) => (
      <div
        key={i}
        className="flex shrink-0 items-center justify-center px-8 transition-transform hover:scale-110"
      >
        <img
          src={marca.src}
          alt={`Logo de la marca aliada ${marca.name}`}
          style={{ width: marca.width ? `${marca.width}px` : "auto", maxHeight: "70px" }}
          className="object-contain opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
          loading="lazy"
        />
      </div>
    ));
  };

  return (
    <div className="w-full bg-slate-50 border-b border-t border-slate-200 py-6 overflow-hidden flex shadow-inner">
      <div className="flex w-fit shrink-0 items-center animate-marquee">
        {renderLogos()}
      </div>
      <div className="flex w-fit shrink-0 items-center animate-marquee" aria-hidden="true">
        {renderLogos()}
      </div>
    </div>
  );
}
