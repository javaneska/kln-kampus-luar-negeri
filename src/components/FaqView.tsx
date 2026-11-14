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
  const h1Words = t.faqPage.h1.split(" ");

  const getCategoryLabel = (key: FaqCategory) => {
    const found = FAQ_CATEGORIES.find((c) => c.key === key);
    return found ? found[lang] : "";
  };

  return (
    <div>
      <Navbar />
      <main id="top">
        <section className="fh">
          <div className="wrap fh-in">
            <div>
              <p className="eyebrow">{t.faqPage.eyebrow}</p>
              <h1 id="h1" aria-label={t.faqPage.h1}>
                {h1Words.map((word, idx) => (
                  <React.Fragment key={idx}>
                    <span
                      className="w"
                      style={{ ["--i" as string]: idx } as React.CSSProperties}
                    >
                      <span>{word}</span>
                    </span>
                    {idx < h1Words.length - 1 ? " " : ""}
                  </React.Fragment>
                ))}
              </h1>
              <p className="lead fade-up">{t.faqPage.lead}</p>
            </div>

            <svg
              className="fart"
              viewBox="0 0 400 240"
              aria-hidden="true"
            >
              <path
                className="a"
                pathLength="1"
                d="M60 220A140 140 0 0 1 340 220"
              />
              <path
                className="a"
                pathLength="1"
                d="M110 220A90 90 0 0 1 290 220"
              />
              <path
                className="a"
                pathLength="1"
                d="M160 220A40 40 0 0 1 240 220"
              />
              <circle cx="200" cy="52" r="10" />
            </svg>
          </div>
        </section>

        <div className="fbar">
          <div className="wrap fbar-in">
            <div className="fsearch">
              <svg
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
                id="q"
                type="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t.faqPage.searchAria}
                placeholder={t.faqPage.searchPlaceholder}
              />
            </div>

            <div
              className="fchips"
              id="cats"
              role="group"
              aria-label={t.faqPage.catAria}
            >
              {FAQ_CATEGORIES.map((c) => {
                const active = category === c.key;
                return (
                  <button
                    key={c.key}
                    id={`faq-cat-${c.key}`}
                    type="button"
                    className="chip"
                    data-c={c.key}
                    aria-pressed={active}
                    onClick={() => setCategory(c.key)}
                  >
                    {c[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <section className="fq">
          <div className="wrap">
            <p className="sr" id="cnt" role="status" aria-live="polite">
              {t.faqPage.count(filteredFaqs.length)}
            </p>

            {filteredFaqs.length > 0 ? (
              <div className="fgrid" id="list">
                {filteredFaqs.map((item, idx) => {
                  const question = lang === "en" ? item.qe : item.qi;
                  const answerHtml = (lang === "en" ? item.ae : item.ai).replace(
                    /\{privacy\}/g,
                    t.footer.privacyUrl
                  );
                  return (
                    <details
                      key={idx}
                      className="fitem"
                      data-c={item.category}
                      open={idx === 0 && category === "all" && !query}
                    >
                      <summary>
                        <span>{question}</span>
                      </summary>
                      <span className="fcat">
                        {getCategoryLabel(item.category)}
                      </span>
                      <div
                        className="ans"
                        dangerouslySetInnerHTML={{ __html: answerHtml }}
                      />
                    </details>
                  );
                })}
              </div>
            ) : (
              <div className="fempty" id="empty">
                {t.faqPage.empty}
              </div>
            )}

            <p className="fnote">{t.faqPage.note}</p>
          </div>
        </section>

        <section className="cta" id="konsul">
          <div className="wrap cta-in">
            <div>
              <p className="eyebrow" style={{ color: "var(--sun)" }}>
                {t.faqPage.ctaEyebrow}
              </p>
              <h2 className="h2">{t.faqPage.ctaTitle}</h2>
              <p>{t.faqPage.ctaBody}</p>
            </div>

            <div className="cbtns">
              <a
                className="btn btn-accent"
                href="https://wa.me/16026005671"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{t.faqPage.ctaWa}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <Link
                className="btn btn-secondary"
                href={consultHref}
                style={{
                  color: "var(--on-brand)",
                  borderColor: "rgba(255,255,255,.55)",
                }}
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
