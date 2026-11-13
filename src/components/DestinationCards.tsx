"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS, StudyLevel, BrandTone } from "@/data/destinations";

const TONE_VARS: Record<BrandTone, string> = {
  brand: "var(--brand)",
  sun: "var(--sun)",
  leaf: "var(--leaf)",
  sky: "var(--sky)",
  ember: "var(--ember)",
};

export function DestinationCards() {
  const { lang, t, shortlist, toggleShortlist } = useApp();
  const [filter, setFilter] = useState<"all" | StudyLevel>("all");

  const destBaseHref = lang === "en" ? "/en/destinations" : "/destinasi";

  return (
    <section id="negara" className="py-16 md:py-20 bg-surface-sunken">
      <div className="max-w-[1160px] mx-auto px-4">
        <div className="grid gap-3 mb-10">
          <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
            {t.destSection.eyebrow}
          </p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] text-ink">
            {t.destSection.title}
          </h2>
        </div>

        <div
          className="flex flex-wrap gap-2 mb-7"
          role="group"
          aria-label={t.destSection.filterAria}
        >
          {(
            [
              { key: "all", label: t.destSection.fAll },
              { key: "s1", label: t.destSection.fS1 },
              { key: "s2", label: t.destSection.fS2 },
              { key: "s3", label: t.destSection.fS3 },
            ] as const
          ).map((item) => {
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                id={`dest-filter-${item.key}`}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item.key)}
                className={`min-h-[44px] px-[18px] rounded-pill border-[1.5px] font-bold text-sm leading-none transition-colors cursor-pointer ${
                  active
                    ? "bg-brand border-brand text-on-brand"
                    : "bg-surface-raised border-line-strong text-ink hover:bg-brand-soft"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.filter(
            (d) => filter === "all" || d.levels.includes(filter)
          ).map((d) => {
            const isPinned = shortlist.includes(d.key);
            return (
              <article
                key={d.key}
                className="group bg-surface-raised border border-line rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-200 flex flex-col"
              >
                <svg
                  className="h-[112px] w-full block"
                  viewBox="0 0 300 120"
                  preserveAspectRatio="xMidYMax slice"
                  aria-hidden="true"
                >
                  <rect width="300" height="120" fill={TONE_VARS[d.tone]} />
                  <path
                    className="transition-transform duration-500 origin-[150px_120px] group-hover:scale-110"
                    fill="none"
                    stroke="var(--surface-100)"
                    strokeWidth="8"
                    d="M120 120A30 30 0 0 1 180 120"
                  />
                  <path
                    className="transition-transform duration-500 origin-[150px_120px] group-hover:scale-110"
                    fill="none"
                    stroke="var(--surface-100)"
                    strokeWidth="8"
                    d="M86 120A64 64 0 0 1 214 120"
                  />
                  <path
                    className="transition-transform duration-500 origin-[150px_120px] group-hover:scale-110"
                    fill="none"
                    stroke="var(--surface-100)"
                    strokeWidth="8"
                    d="M52 120A98 98 0 0 1 248 120"
                  />
                </svg>

                <div className="grid gap-3 p-6 flex-1 content-start">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {d.levels.map((lv) => (
                        <span
                          key={lv}
                          className="px-2.5 py-[3px] rounded-pill font-bold text-xs leading-4 bg-brand-soft text-brand-ink"
                        >
                          {t.destSection.levels[lv]}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-ink-muted">
                      {d.universities.length}{" "}
                      {lang === "en" ? "campuses" : "kampus"}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl leading-[30px] tracking-[-0.3px] text-ink">
                    {d.name[lang]}
                  </h3>

                  <div className="grid gap-1 text-sm leading-5 text-ink-muted">
                    <span>
                      <b className="text-ink font-semibold">
                        {t.destSection.intake}:
                      </b>{" "}
                      {d.intake[lang]}
                    </span>
                    <span>
                      <b className="text-ink font-semibold">
                        {t.destSection.cost}:
                      </b>{" "}
                      {t.destSection.costValue}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Link
                      id={`view-dest-${d.key}`}
                      href={`${destBaseHref}?country=${d.key}`}
                      className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md border-[1.5px] border-line-strong bg-transparent hover:bg-brand-soft text-ink font-bold text-sm leading-none transition-colors"
                    >
                      {t.destSection.viewProgram}
                    </Link>
                    <button
                      id={`pin-dest-${d.key}`}
                      type="button"
                      aria-pressed={isPinned}
                      onClick={() => toggleShortlist(d.key)}
                      className={`inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-md border-[1.5px] font-bold text-xs leading-none transition-colors cursor-pointer ${
                        isPinned
                          ? "bg-leaf-soft border-leaf text-leaf-ink"
                          : "bg-surface-raised border-line-strong text-ink hover:bg-brand-soft"
                      }`}
                    >
                      {isPinned ? t.destSection.pinAdded : t.destSection.pinAdd}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-7 text-sm text-ink-muted">{t.destSection.note}</p>
      </div>
    </section>
  );
}
