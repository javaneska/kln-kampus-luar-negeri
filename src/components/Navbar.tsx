"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { KlnLogo } from "./KlnLogo";

export function Navbar() {
  const { lang, setLang, t, toggleTheme } = useApp();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 8);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const homeHref = lang === "en" ? "/en" : "/";
  const destHref = lang === "en" ? "/en/destinations" : "/negara-tujuan";
  const faqHref = lang === "en" ? "/en/faq" : "/faq";
  const isHome = pathname === "/" || pathname === "/en";
  const isDest =
    pathname?.includes("destinasi") ||
    pathname?.includes("negara-tujuan") ||
    pathname?.includes("destinations");
  const isFaq = pathname?.includes("faq");

  const stepsHref = isHome ? "#langkah" : `${homeHref}#langkah`;
  const auraHref = isHome ? "#aura" : `${homeHref}#aura`;
  const consultHref = isHome ? "#konsultasi" : `${homeHref}#konsultasi`;

  return (
    <>
      <a className="skip" href="#top">
        {lang === "en" ? "Skip to content" : "Langsung ke isi"}
      </a>
      <header
        id="bar"
        className={`bar ${scrolled ? "scrolled" : ""} ${menuOpen ? "open" : ""}`}
      >
        <div className="wrap">
          <div className="bar-in">
            <Link
              href={isHome ? "#top" : homeHref}
              aria-label={t.nav.brandAria}
              className="brand-link"
            >
              <KlnLogo className="logo" />
            </Link>

            <ul className="links" id="links">
              <li>
                <Link
                  href={destHref}
                  aria-current={isDest ? "page" : undefined}
                  className={isDest ? "active" : ""}
                >
                  {t.nav.dest}
                </Link>
              </li>
              <li>
                <Link href={stepsHref}>{t.nav.steps}</Link>
              </li>
              <li>
                <Link href={auraHref}>{t.nav.aura}</Link>
              </li>
              <li>
                <Link
                  href={faqHref}
                  aria-current={isFaq ? "page" : undefined}
                  className={isFaq ? "active" : ""}
                >
                  {t.nav.faq}
                </Link>
              </li>
            </ul>

            <div className="tools">
              <Link
                id="nav-cta-book"
                href={consultHref}
                className="btn btn-primary btn-sm cta-desktop"
              >
                {t.nav.ctaBook}
              </Link>

              <div className="lang" role="group" aria-label="Bahasa / Language">
                <button
                  id="lang-switch-id"
                  type="button"
                  lang="id"
                  aria-pressed={lang === "id"}
                  aria-label="Bahasa Indonesia"
                  onClick={() => setLang("id")}
                >
                  ID
                </button>
                <button
                  id="lang-switch-en"
                  type="button"
                  lang="en"
                  aria-pressed={lang === "en"}
                  aria-label="English"
                  onClick={() => setLang("en")}
                >
                  EN
                </button>
              </div>

              <button
                id="theme"
                type="button"
                onClick={toggleTheme}
                aria-label={t.nav.themeAria}
                className="icon-btn"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              </button>

              <button
                id="menu"
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mnav"
                aria-label={t.nav.menuAria}
                className="icon-btn menu-btn"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <nav id="mnav" className="mnav" aria-label="Menu">
          <div className="wrap">
            <ul>
              <li>
                <Link href={destHref} onClick={() => setMenuOpen(false)}>
                  {t.nav.dest}
                </Link>
              </li>
              <li>
                <Link href={stepsHref} onClick={() => setMenuOpen(false)}>
                  {t.nav.steps}
                </Link>
              </li>
              <li>
                <Link href={auraHref} onClick={() => setMenuOpen(false)}>
                  {t.nav.aura}
                </Link>
              </li>
              <li>
                <Link href={faqHref} onClick={() => setMenuOpen(false)}>
                  {t.nav.faq}
                </Link>
              </li>
              <li>
                <Link href={consultHref} onClick={() => setMenuOpen(false)}>
                  {t.nav.ctaBook}
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div
          id="progress"
          className="progress"
          style={{ transform: `scaleX(${progress.toFixed(3)})` }}
        />
      </header>
    </>
  );
}
