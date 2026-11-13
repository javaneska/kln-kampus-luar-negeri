"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { KlnLogo } from "./KlnLogo";

export function Footer() {
  const { lang, t, shortlist } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    try {
      navigator.clipboard.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const homeHref = lang === "en" ? "/en" : "/";
  const destHref = lang === "en" ? "/en/destinations" : "/destinasi";
  const faqHref = lang === "en" ? "/en/faq" : "/faq";

  return (
    <footer
      className={`bg-[var(--foot)] text-[var(--foot-ink)] pt-14 ${
        shortlist.length > 0 ? "pb-28" : "pb-10"
      }`}
    >
      <div className="max-w-[1160px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-10">
          <div className="md:col-span-2 lg:col-span-1">
            <KlnLogo className="h-16 w-auto text-white" />
            <p className="mt-4 font-display font-extrabold text-lg leading-[26px] max-w-[24ch]">
              {t.tagline}
            </p>
          </div>

          <div>
            <h4 className="m-0 mb-3 font-bold text-xs leading-4 tracking-[1px] uppercase text-[var(--foot-muted)]">
              {t.footer.contact}
            </h4>
            <ul className="list-none m-0 p-0 grid gap-3">
              <li className="flex items-center gap-2.5 flex-wrap">
                <span>WhatsApp</span>
                <a
                  href="https://wa.me/16026005671"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 select-all"
                >
                  +1 602 600 5671
                </a>
                <button
                  id="copy-wa-btn"
                  type="button"
                  onClick={() => handleCopy("wa", "+1 602 600 5671")}
                  className="min-h-[36px] px-3 rounded-[8px] border-[1.5px] border-[var(--foot-muted)] bg-transparent text-[var(--foot-ink)] hover:bg-white/10 font-semibold text-[13px] leading-none cursor-pointer"
                >
                  {copiedKey === "wa" ? t.footer.copied : t.footer.copy}
                </button>
              </li>

              <li className="flex items-center gap-2.5 flex-wrap">
                <span>Email</span>
                <span className="select-all">info@kampusluarnegeri.com</span>
                <button
                  id="copy-email-btn"
                  type="button"
                  onClick={() => handleCopy("mail", "info@kampusluarnegeri.com")}
                  className="min-h-[36px] px-3 rounded-[8px] border-[1.5px] border-[var(--foot-muted)] bg-transparent text-[var(--foot-ink)] hover:bg-white/10 font-semibold text-[13px] leading-none cursor-pointer"
                >
                  {copiedKey === "mail" ? t.footer.copied : t.footer.copy}
                </button>
              </li>

              <li className="opacity-80 text-[14px]">{t.footer.hours}</li>
            </ul>
          </div>

          <div>
            <h4 className="m-0 mb-3 font-bold text-xs leading-4 tracking-[1px] uppercase text-[var(--foot-muted)]">
              {t.footer.more}
            </h4>
            <ul className="list-none m-0 p-0 grid gap-3">
              <li>
                <Link
                  href={t.footer.privacyUrl}
                  className="hover:underline underline-offset-4"
                >
                  {t.formSection.cLink}
                </Link>
              </li>
              <li>
                <Link
                  href={t.footer.termsUrl}
                  className="hover:underline underline-offset-4"
                >
                  {t.formSection.cTerms}
                </Link>
              </li>
              <li>
                <Link href={faqHref} className="hover:underline underline-offset-4">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={destHref} className="hover:underline underline-offset-4">
                  {t.nav.dest}
                </Link>
              </li>
              <li>
                <Link
                  href={`${homeHref}#langkah`}
                  className="hover:underline underline-offset-4"
                >
                  {t.nav.steps}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-white/20 flex flex-wrap gap-x-6 gap-y-2 justify-between text-sm text-[var(--foot-muted)]">
          <span>KLN by GlobalBridger.ID</span>
          <span>Talenta Nusantara Advisory (TNA Group)</span>
        </div>
      </div>
    </footer>
  );
}
