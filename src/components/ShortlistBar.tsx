"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS } from "@/data/destinations";

export function ShortlistBar() {
  const { lang, t, shortlist, toggleShortlist, clearShortlist } = useApp();

  if (shortlist.length === 0) return null;

  const consultHref = lang === "en" ? "/en#konsultasi" : "/#konsultasi";

  return (
    <div
      role="region"
      aria-label={t.destPage.shortAria}
      className="fixed inset-x-0 bottom-0 z-20 bg-surface-raised border-t border-line shadow-[0_-8px_24px_rgba(14,34,64,0.14)] py-3"
    >
      <div className="max-w-[1160px] mx-auto px-4 flex flex-wrap gap-x-4 gap-y-2 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <strong className="font-bold text-sm leading-5 text-ink">
            {t.destPage.shortTitle}
          </strong>
          {shortlist.map((code) => {
            const d = DESTINATIONS.find((item) => item.key === code);
            if (!d) return null;
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-pill bg-brand-soft text-brand-ink font-bold text-[13px] leading-5"
              >
                {d.name[lang]}
                <button
                  type="button"
                  onClick={() => toggleShortlist(code)}
                  aria-label={`${t.destPage.shortRemove}${d.name[lang]}`}
                  className="w-7 h-7 rounded-full grid place-items-center hover:bg-black/10 cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={consultHref}
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md bg-brand text-on-brand hover:bg-brand-hover font-bold text-sm"
          >
            {t.destPage.shortGo}
          </Link>
          <button
            type="button"
            onClick={clearShortlist}
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink hover:bg-brand-soft font-bold text-sm cursor-pointer"
          >
            {t.destPage.shortClear}
          </button>
        </div>
      </div>
    </div>
  );
}
