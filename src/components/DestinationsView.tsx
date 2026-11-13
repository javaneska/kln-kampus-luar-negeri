"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS, BrandTone } from "@/data/destinations";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ShortlistBar } from "./ShortlistBar";

const TONE_VARS: Record<BrandTone, string> = {
  brand: "var(--brand)",
  sun: "var(--sun)",
  leaf: "var(--leaf)",
  sky: "var(--sky)",
  ember: "var(--ember)",
};

const ON_TONE_VARS: Record<BrandTone, string> = {
  brand: "var(--on-brand)",
  sun: "var(--on-sun)",
  leaf: "#ffffff",
  sky: "#0e2240",
  ember: "#0e2240",
};

const GLOBE_ANGLES = [168, 142, 116, 90, 64, 38, 12];

export function DestinationsView() {
  const { lang, t, shortlist, toggleShortlist } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uniQuery, setUniQuery] = useState("");
  const [uniOpen, setUniOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("country");
      if (c) {
        const idx = DESTINATIONS.findIndex((d) => d.key === c);
        if (idx >= 0) setSelectedIndex(idx);
      }
    }
  }, []);

  const currentDest = DESTINATIONS[selectedIndex];
  const isPinned = shortlist.includes(currentDest.key);
  const filteredUnis = currentDest.universities.filter(([name, city, note]) => {
    if (!uniQuery.trim()) return true;
    const q = uniQuery.trim().toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      city.toLowerCase().includes(q) ||
      note.toLowerCase().includes(q)
    );
  });

  const consultHref = lang === "en" ? "/en#konsultasi" : "/#konsultasi";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="top" className="flex-1">
        {/* Hero */}
        <section className="py-12 overflow-hidden">
          <div className="max-w-[1160px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 items-center">
            <div>
              <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
                {t.destPage.eyebrow}
              </p>
              <h1 className="font-display font-extrabold text-[clamp(32px,4.8vw,52px)] leading-[1.1] tracking-[-1px] mt-4 text-ink">
                {t.destPage.h1}
              </h1>
              <p className="mt-5 text-ink-muted text-lg leading-7 max-w-[56ch]">
                {t.destPage.lead}
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <a
                  href="#jelajah"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-md bg-sun text-on-sun hover:bg-ember font-bold text-[15px] leading-none transition-all"
                >
                  <span>{t.destPage.ctaExplore}</span>
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
                <a
                  href="#banding"
                  className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink hover:bg-brand-soft font-bold text-[15px] leading-none transition-all"
                >
                  {t.destPage.ctaCompare}
                </a>
              </div>
            </div>

            {/* Interactive Horizon-Arc Selector */}
            <div className="w-full max-w-[480px] mx-auto aspect-[480/290]">
              <svg
                viewBox="0 0 480 290"
                className="w-full h-full block overflow-visible"
                role="img"
                aria-label={t.destPage.tabsAria}
              >
                {[80, 135, 190].map((r, i) => (
                  <path
                    key={r}
                    fill="none"
                    stroke={
                      i === 0
                        ? "var(--brand)"
                        : i === 1
                        ? "var(--sky)"
                        : "var(--sun)"
                    }
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.9"
                    d={`M${240 - r} 262 A${r} ${r} 0 0 1 ${240 + r} 262`}
                  />
                ))}
                {DESTINATIONS.map((d, i) => {
                  const rad = (GLOBE_ANGLES[i] * Math.PI) / 180;
                  const x = 240 + 190 * Math.cos(rad);
                  const y = 262 - 190 * Math.sin(rad);
                  const active = i === selectedIndex;
                  return (
                    <g
                      key={d.key}
                      onClick={() => setSelectedIndex(i)}
                      className="cursor-pointer transition-transform duration-300"
                    >
                      <circle
                        cx={x.toFixed(1)}
                        cy={y.toFixed(1)}
                        r={active ? 13 : 9}
                        fill={TONE_VARS[d.tone]}
                        stroke="var(--surface-100)"
                        strokeWidth="4"
                      />
                    </g>
                  );
                })}
                <text
                  x="240"
                  y="250"
                  textAnchor="middle"
                  className="font-display font-extrabold text-[17px] fill-ink"
                >
                  {currentDest.name[lang]}
                </text>
              </svg>
            </div>
          </div>
        </section>

        {/* Sticky Country Tabs */}
        <div
          id="jelajah"
          className="sticky top-[64px] z-20 bg-surface-100 border-y border-line"
        >
          <div className="max-w-[1160px] mx-auto px-4">
            <div
              role="tablist"
              aria-label={t.destPage.tabsAria}
              className="flex gap-2 py-2.5 overflow-x-auto"
            >
              {DESTINATIONS.map((d, i) => {
                const selected = i === selectedIndex;
                const listed = shortlist.includes(d.key);
                return (
                  <button
                    key={d.key}
                    id={`tab-${d.key}`}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${d.key}`}
                    onClick={() => setSelectedIndex(i)}
                    className={`flex-none inline-flex items-center gap-2.5 min-h-[44px] px-[18px] rounded-pill border-[1.5px] font-bold text-sm leading-none whitespace-nowrap transition-colors cursor-pointer ${
                      selected
                        ? "bg-brand border-brand text-on-brand"
                        : "bg-surface-raised border-line-strong text-ink hover:bg-brand-soft"
                    }`}
                  >
                    <i
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full flex-none"
                      style={{
                        background: selected
                          ? "var(--on-brand)"
                          : TONE_VARS[d.tone],
                      }}
                    />
                    <span>{d.name[lang]}</span>
                    {listed && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-label={t.destPage.pinned}
                      >
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Country Panel */}
        <section className="py-12 pb-16">
          <div className="max-w-[1160px] mx-auto px-4">
            <div
              role="tabpanel"
              id={`panel-${currentDest.key}`}
              aria-labelledby={`tab-${currentDest.key}`}
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 items-stretch"
            >
              <div
                className="relative overflow-hidden rounded-xl p-8 min-h-[320px] flex flex-col justify-end gap-3"
                style={{
                  background: TONE_VARS[currentDest.tone],
                  color: ON_TONE_VARS[currentDest.tone],
                }}
              >
                <svg
                  viewBox="0 0 600 300"
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 w-[140%] -translate-x-1/2 pointer-events-none"
                >
                  <path
                    fill="none"
                    stroke="var(--surface-100)"
                    strokeWidth="10"
                    d="M230 240A70 70 0 0 1 370 240"
                  />
                  <path
                    fill="none"
                    stroke="var(--surface-100)"
                    strokeWidth="10"
                    d="M170 240A130 130 0 0 1 430 240"
                  />
                  <path
                    fill="none"
                    stroke="var(--surface-100)"
                    strokeWidth="10"
                    d="M110 240A190 190 0 0 1 490 240"
                  />
                </svg>

                <div className="relative flex flex-wrap gap-1.5">
                  {currentDest.levels.map((lv) => (
                    <span
                      key={lv}
                      className="px-2.5 py-[3px] rounded-pill font-bold text-xs leading-4 bg-surface-100 text-ink"
                    >
                      {t.destSection.levels[lv]}
                    </span>
                  ))}
                </div>

                <h2 className="relative font-display font-extrabold text-[clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.8px] m-0">
                  {currentDest.name[lang]}
                </h2>

                <div className="relative grid gap-1 text-[15px] leading-[22px]">
                  <span>
                    <b>{t.destPage.intakeLabel}:</b> {currentDest.intake[lang]}
                  </span>
                  <span>
                    <b>{t.destPage.langLabel}:</b> {currentDest.language[lang]}
                  </span>
                  <span>
                    <b>{t.destPage.costLabel}:</b> {t.destPage.costValue}
                  </span>
                </div>
              </div>

              <div className="bg-surface-raised border border-line rounded-xl p-6 sm:p-8 grid gap-5 content-start shadow-sm">
                <h3 className="font-display font-extrabold text-[22px] leading-7 tracking-[-0.2px] text-ink">
                  {t.destPage.consHeading}
                </h3>

                <ol className="list-none m-0 p-0 grid gap-3.5">
                  {currentDest.considerations[lang].map((item, idx) => (
                    <li key={idx} className="relative pl-11 text-ink">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full bg-brand-soft text-brand-ink grid place-items-center font-display font-extrabold text-sm leading-none"
                      >
                        {idx + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>

                {/* Partner Universities Accordion */}
                <details
                  open={uniOpen}
                  onToggle={(e) =>
                    setUniOpen((e.currentTarget as HTMLDetailsElement).open)
                  }
                  className="border border-line rounded-[14px] bg-surface-100"
                >
                  <summary className="flex items-center justify-between gap-3 min-h-[48px] px-4 font-bold text-[15px] leading-[22px] cursor-pointer list-none">
                    <span>{t.destPage.uniTitle}</span>
                    <span className="ml-auto px-2.5 py-0.5 rounded-pill bg-brand-soft text-brand-ink font-extrabold text-[13px] leading-[18px]">
                      {currentDest.universities.length}
                    </span>
                  </summary>
                  <div className="grid gap-3 px-4 pb-4">
                    <input
                      id="uni-search-input"
                      type="search"
                      value={uniQuery}
                      onChange={(e) => setUniQuery(e.target.value)}
                      placeholder={t.destPage.uniSearch}
                      aria-label={t.destPage.uniSearch}
                      className="w-full min-h-[44px] px-3.5 border-[1.5px] border-line-strong rounded-md bg-surface-raised text-ink text-[15px]"
                    />
                    <ul className="list-none m-0 p-0 max-h-[300px] overflow-y-auto border-t border-line">
                      {filteredUnis.map(([uName, uCity, uNote], uIdx) => (
                        <li
                          key={`${uName}-${uIdx}`}
                          className="flex justify-between gap-3 py-2.5 px-0.5 border-b border-line text-sm leading-5"
                        >
                          <span className="min-w-0 break-words font-medium text-ink">
                            {uName}
                            {uNote && (
                              <em className="ml-1.5 px-2 py-0.5 rounded-pill bg-sun-soft text-sun-ink font-bold text-[11px] leading-4 not-italic whitespace-nowrap">
                                {uNote}
                              </em>
                            )}
                          </span>
                          <small className="flex-none max-w-[45%] text-ink-muted text-right text-[13px] break-words">
                            {uCity}
                          </small>
                        </li>
                      ))}
                    </ul>
                    <p className="m-0 text-ink-muted text-[13px] leading-[18px]">
                      {t.destPage.uniNote}
                    </p>
                  </div>
                </details>

                <p className="flex gap-2.5 items-start p-3.5 rounded-md bg-sun-soft text-sun-ink text-sm leading-5 m-0">
                  <svg
                    className="flex-none mt-0.5"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16.5v.01" />
                  </svg>
                  <span>{t.destPage.verifyNote}</span>
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    id="dest-panel-pin-btn"
                    type="button"
                    aria-pressed={isPinned}
                    onClick={() => toggleShortlist(currentDest.key)}
                    className={`inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border-[1.5px] font-bold text-[15px] leading-none transition-colors cursor-pointer ${
                      isPinned
                        ? "bg-leaf-soft border-leaf text-leaf-ink"
                        : "bg-surface-raised border-line-strong text-ink hover:bg-brand-soft"
                    }`}
                  >
                    {isPinned
                      ? t.destPage.addedShortlist
                      : t.destPage.addShortlist}
                  </button>
                  <Link
                    href={consultHref}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md bg-brand text-on-brand hover:bg-brand-hover font-bold text-[15px] leading-none"
                  >
                    {t.nav.ctaBook}
                  </Link>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-ink-muted">{t.destPage.pageNote}</p>
          </div>
        </section>

        {/* 7-Country Comparison Table */}
        <section id="banding" className="py-16 md:py-20 bg-surface-sunken">
          <div className="max-w-[1160px] mx-auto px-4">
            <div className="grid gap-3 mb-10">
              <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
                {t.destPage.cmpEyebrow}
              </p>
              <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] text-ink">
                {t.destPage.cmpTitle}
              </h2>
              <p className="text-ink-muted text-lg leading-7 max-w-[56ch]">
                {t.destPage.cmpLead}
              </p>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-label={t.destPage.cmpTableAria}
              className="overflow-x-auto border border-line rounded-lg bg-surface-raised shadow-sm"
            >
              <table className="w-full min-w-[720px] border-collapse text-[15px] leading-[22px]">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-[18px] py-3.5 text-left font-display font-extrabold text-[15px] leading-5 bg-brand-soft text-brand-ink whitespace-nowrap border-b border-line"
                    >
                      {t.destPage.cmpCountry}
                    </th>
                    {t.destPage.cmpRows.map((col, idx) => (
                      <th
                        key={idx}
                        scope="col"
                        className="px-[18px] py-3.5 text-left font-display font-extrabold text-[15px] leading-5 bg-brand-soft text-brand-ink whitespace-nowrap border-b border-line"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DESTINATIONS.map((d, i) => {
                    const hl = i === selectedIndex;
                    return (
                      <tr
                        key={d.key}
                        onClick={() => setSelectedIndex(i)}
                        className={`cursor-pointer border-b last:border-b-0 border-line ${
                          hl ? "bg-sun-soft" : "hover:bg-surface-100"
                        }`}
                      >
                        <th
                          scope="row"
                          className="px-[18px] py-3.5 text-left font-bold text-ink whitespace-nowrap"
                        >
                          {d.name[lang]}
                        </th>
                        <td className="px-[18px] py-3.5 text-ink">
                          {d.levels
                            .map((lv) => t.destSection.levels[lv])
                            .join(", ")}
                        </td>
                        <td className="px-[18px] py-3.5 text-ink">
                          {d.intake[lang]}
                        </td>
                        <td className="px-[18px] py-3.5 text-ink">
                          {d.language[lang]}
                        </td>
                        <td className="px-[18px] py-3.5 font-semibold text-ink">
                          {d.universities.length}
                        </td>
                        <td className="px-[18px] py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-pill font-bold text-xs leading-[18px] ${
                              hl
                                ? "bg-surface-raised text-sun-ink"
                                : "bg-sun-soft text-sun-ink"
                            }`}
                          >
                            {t.destPage.costValue}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4 Guiding Questions */}
        <section id="tanya" className="py-16 md:py-20">
          <div className="max-w-[1160px] mx-auto px-4">
            <div className="grid gap-3 mb-10">
              <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
                {t.destPage.qEyebrow}
              </p>
              <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] text-ink">
                {t.destPage.qTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {t.destPage.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-surface-raised border border-line rounded-lg p-6 grid gap-2.5 content-start shadow-sm hover:-translate-y-1 hover:shadow-md transition-all"
                >
                  <b className="font-display font-extrabold text-xl leading-[26px] text-brand">
                    {idx + 1}
                  </b>
                  <h3 className="font-display font-extrabold text-lg leading-6 text-ink">
                    {q.title}
                  </h3>
                  <p className="text-ink-muted text-[15px]">{q.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section id="konsul" className="py-16 bg-brand text-on-brand">
          <div className="max-w-[1160px] mx-auto px-4 flex flex-wrap gap-8 items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] max-w-[22ch]">
                {t.destPage.ctaBannerTitle}
              </h2>
              <p className="mt-3 opacity-90 max-w-[52ch]">
                {t.destPage.ctaBannerBody}
              </p>
            </div>
            <Link
              href={consultHref}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-md bg-sun text-on-sun hover:bg-ember font-bold text-[15px] leading-none"
            >
              <span>{t.destPage.ctaBannerBtn}</span>
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
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <ShortlistBar />
    </div>
  );
}
