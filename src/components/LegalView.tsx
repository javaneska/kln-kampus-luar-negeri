"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { LEGAL_CONTENT } from "@/data/legal";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ShortlistBar } from "./ShortlistBar";

export function LegalView({ docType }: { docType: "privacy" | "terms" }) {
  const { lang, t } = useApp();
  const content = LEGAL_CONTENT[docType][lang];
  const homeHref = lang === "en" ? "/en" : "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-[820px] mx-auto px-4">
          <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
            {content.eyebrow}
          </p>
          <h1 className="font-display font-extrabold text-[clamp(30px,4.5vw,46px)] leading-[1.12] tracking-[-0.8px] mt-3 text-ink">
            {content.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{content.updated}</p>

          <div className="mt-6 p-4 rounded-md bg-sun-soft text-sun-ink text-sm leading-5">
            {content.intro}
          </div>

          <div className="mt-8 grid gap-6">
            {content.sections.map((sec, idx) => (
              <section
                key={idx}
                className="bg-surface-raised border border-line rounded-lg p-6 shadow-sm"
              >
                <h2 className="font-display font-extrabold text-xl leading-7 text-ink">
                  {sec.heading}
                </h2>
                <p className="mt-2.5 text-ink text-base leading-[26px]">
                  {sec.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href={homeHref}
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink hover:bg-brand-soft font-bold text-sm"
            >
              {t.nav.home}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <ShortlistBar />
    </div>
  );
}
