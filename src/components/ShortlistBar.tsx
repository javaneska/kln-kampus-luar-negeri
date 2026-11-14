"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS } from "@/data/destinations";

export function ShortlistBar() {
  const { lang, t, shortlist, toggleShortlist, clearShortlist } = useApp();

  const consultHref = lang === "en" ? "/en#konsultasi" : "/#konsultasi";
  const show = shortlist.length > 0;

  return (
    <div
      className={`short ${show ? "show" : ""}`}
      id="short"
      role="region"
      aria-label={t.destPage.shortAria}
      aria-hidden={!show}
    >
      <div className="wrap short-in">
        <div className="short-l">
          <strong>{t.destPage.shortTitle}</strong>
          <div id="short-chips" style={{ display: "contents" }}>
            {shortlist.map((code) => {
              const d = DESTINATIONS.find((item) => item.key === code);
              if (!d) return null;
              return (
                <span key={code} className="sc">
                  {d.name[lang]}
                  <button
                    type="button"
                    onClick={() => toggleShortlist(code)}
                    aria-label={`${t.destPage.shortRemove}${d.name[lang]}`}
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
        </div>

        <div className="short-r">
          <Link className="btn btn-primary btn-sm" id="short-go" href={consultHref}>
            {t.destPage.shortGo}
          </Link>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="short-clear"
            onClick={clearShortlist}
          >
            {t.destPage.shortClear}
          </button>
        </div>
      </div>
    </div>
  );
}
