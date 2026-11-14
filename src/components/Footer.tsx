"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { KlnLogo } from "./KlnLogo";

export function Footer() {
  const { lang, t } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, val: string) => {
    try {
      navigator.clipboard.writeText(val);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const homeHref = lang === "en" ? "/en" : "/";
  const destHref = lang === "en" ? "/en/destinations" : "/negara-tujuan";
  const faqHref = lang === "en" ? "/en/faq" : "/faq";

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-in">
          <div>
            <KlnLogo className="logo" />
            <p className="tagline">{t.tagline}</p>
          </div>

          <div>
            <h4>{t.footer.contact}</h4>
            <ul>
              <li className="crow">
                <span>WhatsApp</span>
                <a
                  href="https://wa.me/16026005671"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +1 602 600 5671
                </a>
                <button
                  id="copy-wa-btn"
                  type="button"
                  className="copy"
                  onClick={() => handleCopy("wa", "+1 602 600 5671")}
                >
                  {copiedKey === "wa" ? t.footer.copied : t.footer.copy}
                </button>
              </li>

              <li className="crow">
                <span>Email</span>
                <span>info@kampusluarnegeri.com</span>
                <button
                  id="copy-email-btn"
                  type="button"
                  className="copy"
                  onClick={() =>
                    handleCopy("mail", "info@kampusluarnegeri.com")
                  }
                >
                  {copiedKey === "mail" ? t.footer.copied : t.footer.copy}
                </button>
              </li>

              <li className="hours">{t.footer.hours}</li>
            </ul>
          </div>

          <div>
            <h4>{t.footer.more}</h4>
            <ul>
              <li>
                <Link href={t.footer.privacyUrl}>{t.formSection.cLink}</Link>
              </li>
              <li>
                <Link href={t.footer.termsUrl}>{t.formSection.cTerms}</Link>
              </li>
              <li>
                <Link href={faqHref}>FAQ</Link>
              </li>
              <li>
                <Link href={destHref}>{t.nav.dest}</Link>
              </li>
              <li>
                <Link href={`${homeHref}#langkah`}>{t.nav.steps}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="legal">
          <span>KLN by GlobalBridger.ID</span>
          <span>Talenta Nusantara Advisory (TNA Group)</span>
        </div>
      </div>
    </footer>
  );
}
