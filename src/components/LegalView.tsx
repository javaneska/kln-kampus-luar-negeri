"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { LEGAL_CONTENT } from "@/data/legal";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ShortlistBar } from "./ShortlistBar";

export function LegalView({ docType }: { docType: "privacy" | "terms" }) {
  const { lang } = useApp();
  const content = LEGAL_CONTENT[docType][lang];

  return (
    <div>
      <Navbar />
      <main id="top">
        <section className="doc-h">
          <div className="wrap">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className="lead" style={{ marginTop: "12px" }}>
              {content.updated}
            </p>
          </div>
        </section>

        <article className="doc">
          <div className="wrap doc-in">
            <p>{content.intro}</p>
            {content.sections.map((sec, idx) => (
              <React.Fragment key={idx}>
                <h2>{sec.heading}</h2>
                <p>{sec.body}</p>
              </React.Fragment>
            ))}
          </div>
        </article>
      </main>
      <Footer />
      <ShortlistBar />
    </div>
  );
}
