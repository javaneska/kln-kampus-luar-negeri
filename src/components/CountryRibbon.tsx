"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS } from "@/data/destinations";

export function CountryRibbon() {
  const { lang, t } = useApp();
  const names = DESTINATIONS.map((d) => d.name[lang]);
  const doubled = [...names, ...names];

  return (
    <div className="ribbon">
      <div className="wrap ribbon-in">
        <span className="ribbon-label">{t.ribbon.label}</span>
        <div className="ribbon-view">
          <div className="ribbon-track" id="track">
            {doubled.map((name, idx) => (
              <span key={`${name}-${idx}`}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
