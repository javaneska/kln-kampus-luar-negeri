"use client";

import React, { useEffect } from "react";
import { Navbar } from "./Navbar";
import { HeroGlobe } from "./HeroGlobe";
import { CountryRibbon } from "./CountryRibbon";
import { DestinationCards } from "./DestinationCards";
import { StepsSection } from "./StepsSection";
import { AuraChat } from "./AuraChat";
import { ConsultationForm } from "./ConsultationForm";
import { Footer } from "./Footer";
import { ShortlistBar } from "./ShortlistBar";
import { useApp, Language } from "@/context/AppContext";

export function HomeView({ initialLang }: { initialLang?: Language }) {
  const { setLang } = useApp();

  useEffect(() => {
    if (initialLang) {
      setLang(initialLang);
    }
  }, [initialLang, setLang]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-100 text-ink">
      <Navbar />
      <main id="main" className="flex-1">
        <HeroGlobe />
        <CountryRibbon />
        <DestinationCards />
        <StepsSection />
        <AuraChat />
        <ConsultationForm />
      </main>
      <Footer />
      <ShortlistBar />
    </div>
  );
}
