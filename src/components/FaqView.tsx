"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { FAQ_CATEGORIES, FAQ_ITEMS, FaqCategory } from "@/data/faq";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ShortlistBar } from "./ShortlistBar";

export function FaqView() {
  const { lang, t } = useApp();
  const [category, setCategory] = useState<FaqCategory>("all");
  const [query, setQuery] = useState("");

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCat = category === "all" || item.category === category;
    if (!matchesCat) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const questionText = (lang === "en" ? item.qe : item.qi).toLowerCase();
    const answerText = (lang === "en" ? item.ae : item.ai)
      .replace(/<[^>]+>/g, " ")
      .toLowerCase();
    return questionText.includes(q) || answerText.includes(q);
  });

  const consultHref = lang === "en" ? "/en#konsultasi" : "/#konsultasi";

  const getCategoryLabel = (key: FaqCategory) => {
    const found = FAQ_CATEGORIES.find((c) => c.key === key);
    return found ? found[lang] : "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="top" className="flex-1">
        {/* Hero */}
        <section className="pt-12 pb-6 overflow-hidden">
          <div className="max-w-[1160px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10 items-center">
            <div>
              <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
                {t.faqPage.eyebrow}
              </p>
              <h1 className="font-display font-extrabold text-[clamp(32px,4.8vw,52px)] leading-[1.1] tracking-[-1px] mt-4 text-ink">
                {t.faqPage.h1}
              </h1>
              <p className="mt-5 text-ink-muted text-lg leading-7 max-w-[56ch]">
                {t.faqPage.lead}
              </p>
            </div>

            <svg
              className="hidden lg:block w-full max-w-[380px] justify-self-end"
              viewBox="0 0 400 240"
              aria-hidden="true"
            >
              <path
                fill="none"
                stroke="var(--brand)"
                strokeWidth="14"
                d="M60 220A140 140 0 0 1 340 220"
              />
              <path
                fill="none"
                stroke="var(--sky)"
                strokeWidth="14"
                d="M110 220A90 90 0 0 1 290 220"
              />
              <path
                fill="none"
                stroke="var(--sun)"
                strokeWidth="14"
                d="M160 220A40 40 0 0 1 240 220"
              />
              <circle cx="200" cy="52" r="10" fill="var(--ember)" />
            </svg>
          </div>
        </section>

        {/* Search & Category Filter Bar */}
        <div className="sticky top-[64px] z-20 bg-surface-100 border-b border-line py-3">
          <div className="max-w-[1160px] mx-auto px-4 grid gap-3">
            <div className="relative max-w-[560px]">
              <svg
                className="absolute left-3.5 top-3.5 text-ink-muted pointer-events-none"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                id="faq-search-input"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.faqPage.searchAria}
                placeholder={t.faqPage.searchPlaceholder}
                className="w-full min-h-[48px] pl-11 pr-4 border-[1.5px] border-line-strong rounded-[12px] bg-surface-raised text-ink text-base"
              />
            </div>

            <div
              role="group"
              aria-label={t.faqPage.catAria}
              className="flex gap-2 overflow-x-auto pb-0.5"
            >
              {FAQ_CATEGORIES.map((c) => {
                const active = category === c.key;
                return (
                  <button
                    key={c.key}
                    id={`faq-cat-${c.key}`}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c.key)}
                    className={`flex-none min-h-[44px] px-[18px] rounded-pill border-[1.5px] font-bold text-sm leading-none transition-colors cursor-pointer ${
                      active
                        ? "bg-brand border-brand text-on-brand"
                        : "bg-surface-raised border-line-strong text-ink hover:bg-brand-soft"
                    }`}
                  >
                    {c[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <section className="py-8 pb-16">
          <div className="max-w-[1160px] mx-auto px-4">
            <p className="sr-only" role="status" aria-live="polite">
              {t.faqPage.count(filteredFaqs.length)}
            </p>

            {filteredFaqs.length > 0 ? (
              <div className="grid gap-3 max-w-[820px]">
                {filteredFaqs.map((item, idx) => {
                  const question = lang === "en" ? item.qe : item.qi;
                  const answerHtml = (lang === "en" ? item.ae : item.ai).replace(
                    /\{privacy\}/g,
                    t.footer.privacyUrl
                  );
                  return (
                    <details
                      key={idx}
                      className="border border-line rounded-[14px] bg-surface-raised shadow-sm group"
                    >
                      <summary className="flex items-start justify-between gap-4 min-h-[56px] px-5 py-4 font-display font-extrabold text-[17px] leading-6 text-ink cursor-pointer list-none">
                        <span>{question}</span>
                        <span
                          aria-hidden="true"
                          className="flex-none w-2.5 h-2.5 mt-2 border-r-[2.5px] border-b-[2.5px] border-brand rotate-45 group-open:-rotate-135 transition-transform"
                        />
                      </summary>
                      <span className="inline-block mx-5 mb-3 px-2.5 py-0.5 rounded-pill bg-brand-soft text-brand-ink font-bold text-xs leading-[18px]">
                        {getCategoryLabel(item.category)}
                      </span>
                      <div
                        className="px-5 pb-5 text-ink text-base leading-[26px] max-w-[68ch] [&_a]:text-brand-ink [&_a]:underline [&_a]:underline-offset-2"
                        dangerouslySetInnerHTML={{ __html: answerHtml }}
                      />
                    </details>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 border-[1.5px] border-dashed border-line-strong rounded-[14px] text-ink-muted max-w-[820px]">
                {t.faqPage.empty}
              </div>
            )}

            <p className="mt-6 text-sm leading-5 text-ink-muted max-w-[820px]">
              {t.faqPage.note}
            </p>
          </div>
        </section>

        {/* CTA Banner */}
        <section id="konsul" className="py-16 bg-brand text-on-brand">
          <div className="max-w-[1160px] mx-auto px-4 flex flex-wrap gap-8 items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] max-w-[22ch]">
                {t.faqPage.ctaTitle}
              </h2>
              <p className="mt-3 opacity-90 max-w-[52ch]">
                {t.faqPage.ctaBody}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/16026005671"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md bg-sun text-on-sun hover:bg-ember font-bold text-[15px] leading-none"
              >
                {t.faqPage.ctaWa}
              </a>
              <Link
                href={consultHref}
                className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border-[1.5px] border-on-brand bg-transparent text-on-brand hover:bg-white/10 font-bold text-[15px] leading-none"
              >
                {t.faqPage.ctaForm}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ShortlistBar />
    </div>
  );
}
