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
      const items = Array.from(el.querySelectorAll("li"));
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
    <section id="langkah" className="py-16 md:py-20">
      <div className="max-w-[1160px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-24 grid gap-4">
          <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
            {t.stepsSection.eyebrow}
          </p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] text-ink">
            {t.stepsSection.title}
          </h2>
          <p className="text-ink-muted text-lg leading-7 max-w-[56ch]">
            {t.stepsSection.lead}
          </p>
        </div>

        <ol
          ref={listRef}
          className="relative grid gap-10 pl-14 sm:pl-16 m-0 list-none"
        >
          <div
            aria-hidden="true"
            className="absolute left-[19px] top-5 bottom-5 w-[3px] rounded-sm bg-line"
          >
            <div
              className="absolute inset-x-0 top-0 rounded-sm bg-brand transition-all duration-150"
              style={{ height: `${fillPct * 100}%` }}
            />
          </div>

          {t.stepsSection.items.map((step, idx) => {
            const isOn = idx <= activeIndex;
            return (
              <li key={idx} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -left-14 sm:-left-16 top-0 w-[42px] h-[42px] rounded-full grid place-items-center border-2 font-display font-extrabold text-base leading-none transition-all duration-300 ${
                    isOn
                      ? "bg-brand text-on-brand border-brand scale-105"
                      : "bg-surface-raised text-ink-muted border-line-strong"
                  }`}
                >
                  {idx + 1}
                </span>
                <h3 className="font-display font-extrabold text-[22px] leading-7 tracking-[-0.2px] pt-1.5 text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-ink-muted max-w-[46ch]">{step.desc}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
