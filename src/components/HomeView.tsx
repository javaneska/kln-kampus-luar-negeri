"use client";

import React, { useEffect } from "react";
import { Navbar } from "./Navbar";
import { HeroGlobe } from "./HeroGlobe";
import { CountryRibbon } from "./CountryRibbon";
import { StepsSection } from "./StepsSection";
import { DestinationCards } from "./DestinationCards";
import { AuraChat } from "./AuraChat";
import { ConsultationForm } from "./ConsultationForm";
import { Footer } from "./Footer";
import { ShortlistBar } from "./ShortlistBar";
import { useApp, Lang } from "@/context/AppContext";

export function HomeView({ initialLang }: { initialLang?: Lang }) {
  const { setLang, shortlist } = useApp();

  useEffect(() => {
    if (initialLang) {
      setLang(initialLang);
    }
  }, [initialLang, setLang]);

  return (
    <div className={shortlist.length > 0 ? "has-short" : ""}>
      <Navbar />
      <main id="top">
        <HeroGlobe />
        <CountryRibbon />
        <StepsSection />
        <DestinationCards />
        <AuraChat />
        <ConsultationForm />
      </main>
      <Footer />
      <ShortlistBar />
    </div>
  );
}
