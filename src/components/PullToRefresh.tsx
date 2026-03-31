"use client";

import { useCallback, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 80; // px que necesitas jalar para activar

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Solo activar si estamos arriba del todo
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = Math.max(0, currentY - startY.current);
    // Efecto de resistencia (el movimiento se ralentiza cuanto más jalas)
    setPullDistance(Math.min(diff * 0.4, 120));
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.5);
      // Refrescar la página con Next.js router
      router.refresh();
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
        setPulling(false);
      }, 1000);
    } else {
      setPullDistance(0);
      setPulling(false);
    }
  }, [pullDistance, refreshing, router]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Indicador visual */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-opacity z-50"
        style={{
          top: pullDistance - 40,
          opacity: progress > 0.1 ? progress : 0,
        }}
      >
        <div className={`bg-white shadow-lg rounded-full p-2.5 border border-slate-200 ${refreshing ? "animate-spin" : ""}`}>
          <RefreshCw
            size={18}
            className="text-primary"
            style={{
              transform: refreshing ? "none" : `rotate(${progress * 360}deg)`,
              transition: refreshing ? "none" : "transform 0s",
            }}
          />
        </div>
      </div>

      {/* Contenido con desplazamiento */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : "none",
          transition: pulling && pullDistance > 0 ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
