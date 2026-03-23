import "@/index.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "Repuestos Sotomayor | Repuestos y Autopartes en Venezuela",
  description: "Catálogo de repuestos y autopartes para tu vehículo. Precios en efectivo y Tasa BCV. Pídenos por WhatsApp.",
  icons: {
    icon: "/favicon.ico?v=2",
  },
  openGraph: {
    title: "Repuestos Sotomayor",
    description: "Repuestos y autopartes. Precios en USD Efectivo y Tasa BCV.",
    locale: "es_VE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
