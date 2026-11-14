"use client";

import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

export function StepsSection() {
  const { t } = useApp();
  const listRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [fillPct, setFillPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = listRef.current;
      if (!el) return;
      const items = Array.from(el.querySelectorAll("li.step"));
      if (items.length === 0) return;

      const mark = window.innerHeight * 0.62;
      const first = items[0].getBoundingClientRect();
      const last = items[items.length - 1].getBoundingClientRect();
      const total = Math.max(1, last.top - first.top);
      const p = Math.max(0, Math.min(1, (mark - first.top) / total));
      setFillPct(p);

      let highest = 0;
      items.forEach((item, idx) => {
        if (idx === 0 || item.getBoundingClientRect().top < mark) {
          highest = idx;
        }
      });
      setActiveIndex(highest);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="sec" id="langkah">
      <div className="wrap steps-in">
        <div className="steps-intro">
          <p className="eyebrow">{t.stepsSection.eyebrow}</p>
          <h2 className="h2">{t.stepsSection.title}</h2>
          <p className="lead">{t.stepsSection.lead}</p>
        </div>

        <ol ref={listRef} className="steps" id="steps">
          <div className="rail" aria-hidden="true">
            <div
              className="rail-fill"
              id="rail-fill"
              style={{ height: `${(fillPct * 100).toFixed(1)}%` }}
            />
          </div>

          {t.stepsSection.items.map((step, idx) => {
            const isOn = idx <= activeIndex;
            return (
              <li key={idx} className={`step ${isOn ? "on" : ""}`}>
                <span className="n" aria-hidden="true">
                  {idx + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
