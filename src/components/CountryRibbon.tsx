"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS } from "@/data/destinations";

export function CountryRibbon() {
  const { lang, t } = useApp();
  const names = DESTINATIONS.map((d) => d.name[lang]);
  const doubled = [...names, ...names];

  return (
    <div className="bg-brand-soft text-brand-ink overflow-hidden border-y border-line">
      <div className="max-w-[1160px] mx-auto px-4 flex items-center gap-6">
        <span className="hidden sm:inline-block flex-none font-bold text-xs leading-4 tracking-[1px] uppercase py-4">
          {t.ribbon.label}
        </span>
        <div
          className="kln-ribbon-view flex-1 min-w-0 overflow-hidden py-4"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
          }}
        >
          <div className="kln-ribbon-track">
            {doubled.map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="inline-flex items-center gap-6 pr-6 font-display font-extrabold text-[15px] leading-none tracking-[0.2px] whitespace-nowrap"
              >
                {name}
                <i
                  aria-hidden="true"
                  className="inline-block w-2 h-2 rounded-full bg-sun"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
