"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS, StudyLevel } from "@/data/destinations";
import { KLN_MAPS } from "@/data/maps";

export function DestinationCards() {
  const { lang, t } = useApp();
  const [filter, setFilter] = useState<"all" | StudyLevel>("all");

  const destBaseHref = lang === "en" ? "/en/destinations" : "/negara-tujuan";

  return (
    <section className="sec dest" id="negara">
      <div className="wrap">
        <div className="sec-head">
          <p className="eyebrow">{t.destSection.eyebrow}</p>
          <h2 className="h2">{t.destSection.title}</h2>
        </div>

        <div
          className="chips"
          id="chips"
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
                className="chip"
                data-f={item.key}
                aria-pressed={active}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="cards" id="cards">
          {DESTINATIONS.filter(
            (d) => filter === "all" || d.levels.includes(filter)
          ).map((d) => {
            const m = KLN_MAPS[d.key];
            return (
              <article key={d.key} className="card pop">
                <svg
                  className={`card-art t-${d.tone}`}
                  style={{ background: `var(--${d.tone})` }}
                  viewBox="0 0 300 150"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  {m && (
                    <>
                      <path className="m-land" d={m.d} />
                      <path className="m-route" d={m.route} />
                      <circle
                        className="m-ring"
                        cx={m.pin[0]}
                        cy={m.pin[1]}
                        r="5"
                      />
                      <circle
                        className="m-pin"
                        cx={m.pin[0]}
                        cy={m.pin[1]}
                        r="4.5"
                      />
                      <path
                        className="m-plane"
                        style={
                          {
                            offsetPath: `path('${m.route}')`,
                          } as React.CSSProperties
                        }
                        d="M10 0L-9-6.5L-5 0L-9 6.5Z"
                      />
                    </>
                  )}
                </svg>

                <div className="card-body">
                  <div className="pills">
                    {d.levels.map((lv) => (
                      <span key={lv} className="pill">
                        {t.destSection.levels[lv]}
                      </span>
                    ))}
                  </div>

                  <h3>{d.name[lang]}</h3>

                  <div className="meta">
                    <span>
                      <b>{t.destSection.intake}:</b> {d.intake[lang]}
                    </span>
                    <span>
                      <b>{t.destSection.cost}:</b> {t.destSection.costValue}
                    </span>
                  </div>

                  <Link
                    id={`view-dest-${d.key}`}
                    className="btn btn-secondary btn-sm"
                    href={`${destBaseHref}?country=${d.key}#${d.key}`}
                  >
                    <span>
                      {lang === "en"
                        ? "See universities and considerations"
                        : "Lihat kampus dan pertimbangan"}
                    </span>
                    <svg
                      width="16"
                      height="16"
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
              </article>
            );
          })}
        </div>

        <p className="note">{t.destSection.note}</p>
      </div>
    </section>
  );
}
