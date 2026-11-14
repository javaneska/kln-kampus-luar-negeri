"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS, BrandTone } from "@/data/destinations";
import { KLN_MAPS } from "@/data/maps";
import { KLN_LANDMARKS } from "@/data/landmarks";
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

const UNI_NOTE_TRANSLATIONS: Record<string, string> = {
  "melalui Study Group": "via Study Group",
  "melalui Navitas": "via Navitas",
  "program gelar Amerika": "American degree program",
  "jalur persiapan bisnis dan ekonomi": "business & economics pathway",
  "jalur persiapan": "foundation pathway",
};

export function DestinationsView() {
  const { lang, t, shortlist, toggleShortlist } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uniQuery, setUniQuery] = useState("");
  const [lmPlay, setLmPlay] = useState(false);
  const [lmSwap, setLmSwap] = useState(false);
  const [panelSwap, setPanelSwap] = useState(false);
  const swapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mqReduce =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!mqReduce) setLmPlay(true);

      const params = new URLSearchParams(window.location.search);
      const c = params.get("country") || window.location.hash.replace("#", "");
      if (c) {
        const idx = DESTINATIONS.findIndex((d) => d.key === c);
        if (idx >= 0) setSelectedIndex(idx);
      }
    }
    return () => {
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    };
  }, []);

  const handleSelectCountry = (idx: number) => {
    if (idx === selectedIndex) {
      replayLandmark();
      return;
    }
    const mqReduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (mqReduce) {
      setSelectedIndex(idx);
      return;
    }

    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    setLmSwap(true);
    setLmPlay(false);
    setPanelSwap(true);

    swapTimerRef.current = window.setTimeout(() => {
      setSelectedIndex(idx);
      setLmSwap(false);
      window.requestAnimationFrame(() => {
        setLmPlay(true);
      });
    }, 200);
  };

  const replayLandmark = () => {
    const mqReduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (mqReduce) return;
    setLmPlay(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setLmPlay(true);
      });
    });
  };

  const currentDest = DESTINATIONS[selectedIndex];
  const currentMap = KLN_MAPS[currentDest.key];
  const currentLandmark = KLN_LANDMARKS[currentDest.key] || KLN_LANDMARKS.us;
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
  const auraHref = lang === "en" ? "/en#aura" : "/#aura";
  const h1Words = t.destPage.h1.split(" ");

  return (
    <div className={shortlist.length > 0 ? "has-short" : ""}>
      <Navbar />
      <main id="top">
        {/* Hero with Landmark Vector Animation */}
        <section className="dh">
          <div className="wrap dh-in">
            <div>
              <p className="eyebrow">{t.destPage.eyebrow}</p>
              <h1 id="h1" aria-label={t.destPage.h1}>
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
              <p className="lead fade-up">{t.destPage.lead}</p>
              <div className="cta-row fade-up">
                <a className="btn btn-accent" href="#jelajah">
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
                <a className="btn btn-secondary" href="#banding">
                  {t.destPage.ctaCompare}
                </a>
              </div>
            </div>

            <figure
              className={`lmk ${lmPlay ? "play" : ""} ${lmSwap ? "swap" : ""}`}
              id="globe"
              onClick={replayLandmark}
              title={
                lang === "en"
                  ? "Click to replay landmark animation"
                  : "Klik untuk memutar ulang animasi landmark"
              }
            >
              <svg
                className="lmk-art"
                id="lm-art"
                data-k={currentDest.key}
                viewBox="0 0 480 320"
                role="img"
                aria-label={currentLandmark[lang]}
                dangerouslySetInnerHTML={{
                  __html: `<defs><clipPath id="l-clip"><rect x="-40" y="-40" width="560" height="291"></rect></clipPath></defs>${currentLandmark.svg}`,
                }}
              />
              <figcaption className="lmk-name" id="lm-name">
                {currentLandmark[lang]}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Sticky Country Tabs */}
        <div className="tabsbar" id="jelajah">
          <div className="wrap">
            <div
              className="tabs"
              id="tabs"
              role="tablist"
              aria-label={t.destPage.tabsAria}
            >
              {DESTINATIONS.map((d, i) => {
                const selected = i === selectedIndex;
                const listed = shortlist.includes(d.key);
                return (
                  <button
                    key={d.key}
                    id={`tab-${d.key}`}
                    role="tab"
                    aria-controls={`p-${d.key}`}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => handleSelectCountry(i)}
                    className={`tab ${listed ? "listed" : ""}`}
                    style={
                      {
                        ["--c" as string]: TONE_VARS[d.tone],
                      } as React.CSSProperties
                    }
                  >
                    <i aria-hidden="true" />
                    <span>{d.name[lang]}</span>
                    <svg
                      className="pinned"
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Country Panel */}
        <section className="sec-d">
          <div className="wrap">
            <div id="panels">
              <div
                key={currentDest.key}
                role="tabpanel"
                id={`p-${currentDest.key}`}
                aria-labelledby={`tab-${currentDest.key}`}
                className={`panel ${panelSwap ? "swap" : ""}`}
              >
                <div
                  className="pcard"
                  style={
                    {
                      ["--c" as string]: TONE_VARS[currentDest.tone],
                      ["--on" as string]: ON_TONE_VARS[currentDest.tone],
                    } as React.CSSProperties
                  }
                >
                  {currentMap && (
                    <svg
                      className={`pmap t-${currentDest.tone}`}
                      viewBox="0 0 300 150"
                      preserveAspectRatio="xMidYMid meet"
                      aria-hidden="true"
                    >
                      <path className="m-land" d={currentMap.d} />
                      <path className="m-route" d={currentMap.route} />
                      <circle
                        className="m-ring"
                        cx={currentMap.pin[0]}
                        cy={currentMap.pin[1]}
                        r="5"
                      />
                      <circle
                        className="m-pin"
                        cx={currentMap.pin[0]}
                        cy={currentMap.pin[1]}
                        r="4.5"
                      />
                      <path
                        className="m-plane"
                        style={
                          {
                            offsetPath: `path('${currentMap.route}')`,
                          } as React.CSSProperties
                        }
                        d="M10 0L-9-6.5L-5 0L-9 6.5Z"
                      />
                    </svg>
                  )}

                  <div className="pills">
                    {currentDest.levels.map((lv) => (
                      <span key={lv} className="pill">
                        {t.destSection.levels[lv]}
                      </span>
                    ))}
                  </div>

                  <h2>{currentDest.name[lang]}</h2>

                  <div className="meta">
                    <span>
                      <b>{t.destPage.intakeLabel}:</b> {currentDest.intake[lang]}
                    </span>
                    <span>
                      <b>{t.destPage.langLabel}:</b>{" "}
                      {currentDest.language[lang]}
                    </span>
                    <span>
                      <b>{t.destPage.costLabel}:</b> {t.destPage.costValue}
                    </span>
                  </div>
                </div>

                <div className="pbody">
                  <h3>{t.destPage.consHeading}</h3>

                  <ol className="cons">
                    {currentDest.considerations[lang].map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>

                  <details className="unis" open>
                    <summary>
                      <span>{t.destPage.unisSummary}</span>
                      <span className="ucnt">
                        {currentDest.universities.length}
                      </span>
                    </summary>
                    <div className="uwrap">
                      <input
                        id="uni-search-input"
                        className="usearch"
                        type="search"
                        value={uniQuery}
                        onChange={(e) => setUniQuery(e.target.value)}
                        placeholder={t.destPage.unisSearchPlaceholder}
                        aria-label={t.destPage.unisSearchPlaceholder}
                        autoComplete="off"
                      />
                      <ul className="ulist">
                        {filteredUnis.map(([uName, uCity, uNote], uIdx) => {
                          const translatedNote =
                            lang === "en" && uNote
                              ? UNI_NOTE_TRANSLATIONS[uNote] || uNote
                              : uNote;
                          return (
                            <li key={`${uName}-${uIdx}`}>
                              <span>
                                {uName}
                                {translatedNote && (
                                  <em className="utag">{translatedNote}</em>
                                )}
                              </span>
                              <small>{uCity}</small>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="unote">{t.destPage.unisNote}</p>
                    </div>
                  </details>

                  <div className="verify">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v5M12 16h.01" />
                    </svg>
                    <span>{t.destPage.verifyNote}</span>
                  </div>

                  <div className="prow">
                    <Link
                      href={consultHref}
                      className="btn btn-primary btn-sm"
                    >
                      <span>
                        {t.destPage.discussPrefix}
                        {currentDest.name[lang]}
                        {t.destPage.discussSuffix}
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

                    <button
                      id={`pin-country-${currentDest.key}`}
                      type="button"
                      aria-pressed={isPinned}
                      onClick={() => toggleShortlist(currentDest.key)}
                      className="btn btn-secondary btn-sm btn-pin"
                    >
                      {isPinned ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      )}
                      <span>
                        {isPinned
                          ? t.destSection.pinAdded
                          : t.destSection.pinAdd}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Side-by-Side Comparison Table */}
        <section className="cmp" id="banding">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">{t.destPage.cmpEyebrow}</p>
              <h2 className="h2">{t.destPage.cmpTitle}</h2>
              <p className="lead">{t.destPage.cmpLead}</p>
            </div>

            <div className="tblw" role="region" aria-labelledby="cmp-title" tabIndex={0}>
              <table id="tbl">
                <caption id="cmp-title" className="sr">
                  {t.destPage.cmpCaption}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{t.destPage.thAspect}</th>
                    {DESTINATIONS.map((d, idx) => (
                      <th
                        key={d.key}
                        scope="col"
                        data-i={idx}
                        className={idx === selectedIndex ? "sel" : ""}
                      >
                        {d.name[lang]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{t.destPage.rLevel}</th>
                    {DESTINATIONS.map((d, idx) => (
                      <td
                        key={d.key}
                        data-i={idx}
                        className={idx === selectedIndex ? "sel" : ""}
                      >
                        {d.levels
                          .map((lv) => t.destSection.levels[lv])
                          .join(", ")}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">{t.destPage.rIntake}</th>
                    {DESTINATIONS.map((d, idx) => (
                      <td
                        key={d.key}
                        data-i={idx}
                        className={idx === selectedIndex ? "sel" : ""}
                      >
                        {d.intake[lang]}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">{t.destPage.rLang}</th>
                    {DESTINATIONS.map((d, idx) => (
                      <td
                        key={d.key}
                        data-i={idx}
                        className={idx === selectedIndex ? "sel" : ""}
                      >
                        {d.language[lang]}
                      </td>
                    ))}
                  </tr>
                  <tr className="hl">
                    <th scope="row">{t.destPage.rCost}</th>
                    {DESTINATIONS.map((d, idx) => (
                      <td
                        key={d.key}
                        data-i={idx}
                        className={idx === selectedIndex ? "sel" : ""}
                      >
                        <span className="tag2">{t.destPage.costValue}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="note">{t.destPage.cmpNote}</p>
          </div>
        </section>

        {/* 4 Guiding Questions */}
        <section className="sec" id="tanya">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">{t.destPage.qEyebrow}</p>
              <h2 className="h2">{t.destPage.qTitle}</h2>
              <p className="lead">{t.destPage.qLead}</p>
            </div>

            <div className="qs">
              {t.destPage.questions.map((q, idx) => (
                <article key={idx} className="q">
                  <b>{`0${idx + 1}`}</b>
                  <h3>{q.title}</h3>
                  <p>{q.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta" id="konsul">
          <div className="wrap cta-in">
            <div>
              <p className="eyebrow" style={{ color: "var(--sun)" }}>
                {t.destPage.ctaEyebrow}
              </p>
              <h2 className="h2">{t.destPage.ctaTitle}</h2>
              <p>{t.destPage.ctaBody}</p>
            </div>
            <div className="prow">
              <Link className="btn btn-accent" href={consultHref}>
                <span>{t.destPage.ctaBtnBook}</span>
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
              <Link
                className="btn btn-secondary"
                href={auraHref}
                style={{
                  color: "var(--on-brand)",
                  borderColor: "rgba(255,255,255,.55)",
                }}
              >
                {t.destPage.ctaBtnAura}
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
