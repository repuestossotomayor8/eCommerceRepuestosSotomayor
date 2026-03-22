"use client";

import { useEffect, useState } from "react";
import { X, Zap } from "lucide-react";

export default function DiscountBanner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Slight delay so it feels like a smooth welcome
    const showTimer = setTimeout(() => setVisible(true), 600);
    // Auto-dismiss after 5s
    const hideTimer = setTimeout(() => dismiss(), 5800);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 transition-all duration-500 ease-out ${
        exiting
          ? "translate-y-8 opacity-0 scale-95"
          : "translate-y-0 opacity-100 scale-100"
      }`}
      style={{ animation: exiting ? undefined : "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 px-5 py-4 shadow-2xl shadow-green-900/40">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/10 to-green-500/5 animate-pulse" />

        {/* Icon */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 ring-1 ring-green-500/30">
          <Zap className="h-5 w-5 text-green-400" fill="currentColor" />
        </div>

        {/* Text */}
        <div className="relative flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-green-400">
            ¡Oferta Especial!
          </p>
          <p className="mt-0.5 font-display text-sm font-bold leading-snug text-white sm:text-base">
            Todos nuestros productos tienen{" "}
            <span className="text-green-400">descuentos hasta el 40%</span>
          </p>
          <p className="mt-0.5 text-xs text-green-300/70">
            Paga en USDT, Zelle o $ efectivo y ahorra hasta 40%
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-green-400/60 transition-colors hover:bg-green-500/20 hover:text-green-300"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(2rem); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
