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
  const destHref = lang === "en" ? "/en/destinations" : "/destinasi";
  const faqHref = lang === "en" ? "/en/faq" : "/faq";
  const consultHref = `${homeHref}#konsultasi`;

  const isHome = pathname === "/" || pathname === "/en";
  const isDest = pathname?.includes("destinasi") || pathname?.includes("destinations");
  const isFaq = pathname?.includes("faq");

  return (
    <header
      id="navbar"
      className={`sticky top-0 z-30 bg-surface-raised border-b border-line transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-[1160px] mx-auto px-4">
        <div className="flex items-center gap-6 min-h-[64px] py-2">
          <Link
            href={homeHref}
            aria-label="KLN, Kampus Luar Negeri"
            className="block flex-none text-ink"
          >
            <KlnLogo className="h-10 w-auto" />
          </Link>

          <ul className="hidden md:flex items-center gap-6 list-none m-0 ml-2 p-0 flex-1">
            <li>
              <Link
                href={homeHref}
                aria-current={isHome ? "page" : undefined}
                className={`inline-block py-2 font-semibold text-[15px] leading-5 border-b-2 transition-colors whitespace-nowrap ${
                  isHome
                    ? "text-brand border-brand"
                    : "text-ink border-transparent hover:border-sun"
                }`}
              >
                {t.nav.home}
              </Link>
            </li>
            <li>
              <Link
                href={destHref}
                aria-current={isDest ? "page" : undefined}
                className={`inline-block py-2 font-semibold text-[15px] leading-5 border-b-2 transition-colors whitespace-nowrap ${
                  isDest
                    ? "text-brand border-brand"
                    : "text-ink border-transparent hover:border-sun"
                }`}
              >
                {t.nav.dest}
              </Link>
            </li>
            <li>
              <Link
                href={`${homeHref}#aura`}
                className="inline-block py-2 font-semibold text-[15px] leading-5 text-ink border-b-2 border-transparent hover:border-sun transition-colors whitespace-nowrap"
              >
                {t.nav.aura}
              </Link>
            </li>
            <li>
              <Link
                href={faqHref}
                aria-current={isFaq ? "page" : undefined}
                className={`inline-block py-2 font-semibold text-[15px] leading-5 border-b-2 transition-colors whitespace-nowrap ${
                  isFaq
                    ? "text-brand border-brand"
                    : "text-ink border-transparent hover:border-sun"
                }`}
              >
                {t.nav.faq}
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              id="nav-cta-book"
              href={consultHref}
              className="hidden md:inline-flex items-center justify-center min-h-[40px] px-4 rounded-md bg-brand text-on-brand hover:bg-brand-hover font-bold text-[14px] leading-none whitespace-nowrap transition-all hover:-translate-y-[1px] hover:shadow-md"
            >
              {t.nav.ctaBook}
            </Link>

            <div
              className="inline-flex p-[2px] border-[1.5px] border-line-strong rounded-pill bg-surface-raised"
              role="group"
              aria-label="Bahasa / Language"
            >
              <button
                id="lang-switch-id"
                type="button"
                lang="id"
                aria-pressed={lang === "id"}
                aria-label="Bahasa Indonesia"
                onClick={() => setLang("id")}
                className={`min-w-[40px] min-h-[32px] px-2 rounded-pill font-bold text-[13px] leading-none tracking-[0.5px] transition-colors cursor-pointer ${
                  lang === "id"
                    ? "bg-brand text-on-brand"
                    : "bg-transparent text-ink hover:bg-brand-soft hover:text-brand-ink"
                }`}
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
                className={`min-w-[40px] min-h-[32px] px-2 rounded-pill font-bold text-[13px] leading-none tracking-[0.5px] transition-colors cursor-pointer ${
                  lang === "en"
                    ? "bg-brand text-on-brand"
                    : "bg-transparent text-ink hover:bg-brand-soft hover:text-brand-ink"
                }`}
              >
                EN
              </button>
            </div>

            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={t.nav.themeAria}
              className="inline-grid place-items-center w-[44px] h-[44px] border-[1.5px] border-line-strong rounded-md bg-surface-raised text-ink hover:bg-brand-soft transition-colors cursor-pointer"
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
              id="mobile-menu-btn"
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={t.nav.menuAria}
              className="md:hidden inline-grid place-items-center w-[44px] h-[44px] border-[1.5px] border-line-strong rounded-md bg-surface-raised text-ink hover:bg-brand-soft transition-colors cursor-pointer"
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

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Menu"
          className="md:hidden border-t border-line bg-surface-raised"
        >
          <div className="max-w-[1160px] mx-auto px-4">
            <ul className="list-none m-0 py-2 pb-4 grid gap-1">
              <li>
                <Link
                  href={homeHref}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-semibold text-base text-ink"
                >
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href={destHref}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-semibold text-base text-ink"
                >
                  {t.nav.dest}
                </Link>
              </li>
              <li>
                <Link
                  href={`${homeHref}#aura`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-semibold text-base text-ink"
                >
                  {t.nav.aura}
                </Link>
              </li>
              <li>
                <Link
                  href={faqHref}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-semibold text-base text-ink"
                >
                  {t.nav.faq}
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href={consultHref}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md bg-brand text-on-brand font-bold text-[15px]"
                >
                  {t.nav.ctaBook}
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}

      <div
        aria-hidden="true"
        className="absolute left-0 -bottom-[1px] h-[3px] w-full origin-left bg-sun"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}
