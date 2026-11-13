"use client";

import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  quickKey?: "q1" | "q2" | "q3" | "q4";
}

export function AuraChat() {
  const { lang, t } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, busy]);

  const handleQuickQuestion = (qKey: "q1" | "q2" | "q3" | "q4") => {
    if (busy) return;
    setBusy(true);
    const pair = t.auraSection.quickDialogs[qKey];
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      text: pair[0],
      quickKey: qKey,
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: "assistant",
        text: pair[1],
        quickKey: qKey,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setBusy(false);
    }, 650);
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || busy) return;

    setInput("");
    setBusy(true);
    const userMsg: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/aura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, lang }),
      });
      const data = await res.json();
      const replyText =
        data?.reply || t.auraSection.quickDialogs.q1[1];
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: replyText,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: t.auraSection.quickDialogs.q4[1],
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="aura" className="py-16 md:py-20 bg-surface-sunken">
      <div className="max-w-[1160px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-14 items-center">
        <div className="grid gap-4">
          <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-brand-ink">
            {t.auraSection.eyebrow}
          </p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px] text-ink">
            {t.auraSection.title}
          </h2>
          <p className="text-ink-muted text-lg leading-7 max-w-[56ch]">
            {t.auraSection.body}
          </p>
          <ul className="list-none m-0 mt-2 p-0 grid gap-2.5">
            {[t.auraSection.b1, t.auraSection.b2, t.auraSection.b3].map(
              (bullet, i) => (
                <li key={i} className="flex gap-2.5 items-start text-ink">
                  <svg
                    className="flex-none mt-[3px] text-leaf"
                    width="20"
                    height="20"
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
                  <span>{bullet}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <div
          id="aura-chat-window"
          className="bg-surface-raised border border-line rounded-xl shadow-md overflow-hidden flex flex-col"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
            <span
              aria-hidden="true"
              className="flex-none grid place-items-center w-10 h-10 rounded-full bg-sun text-on-sun font-display font-extrabold text-lg leading-none"
            >
              A
            </span>
            <div>
              <strong className="block font-display font-extrabold text-[17px] leading-[22px] text-ink">
                Aura
              </strong>
              <small className="text-ink-muted text-[13px]">
                {t.auraSection.chatSub}
              </small>
            </div>
            <span className="hidden sm:inline-block ml-auto px-2.5 py-[3px] rounded-pill bg-sun-soft text-sun-ink font-bold text-xs leading-4 whitespace-nowrap">
              {t.auraSection.chatTag}
            </span>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="h-[320px] overflow-y-auto p-5 flex flex-col gap-3 bg-surface-100 scroll-smooth"
          >
            <div className="self-start max-w-[86%] px-4 py-3 rounded-lg rounded-bl-[4px] bg-surface-raised border border-line text-[15px] leading-[22px] text-ink">
              <span className="block font-bold text-[11px] leading-4 tracking-[1px] uppercase text-brand-ink mb-1">
                AURA
              </span>
              {t.auraSection.chatIntro}
            </div>

            {messages.map((m) => {
              const displayText = m.quickKey
                ? t.auraSection.quickDialogs[m.quickKey][
                    m.role === "user" ? 0 : 1
                  ]
                : m.text;
              return m.role === "user" ? (
                <div
                  key={m.id}
                  className="self-end max-w-[86%] px-4 py-3 rounded-lg rounded-br-[4px] bg-brand text-on-brand text-[15px] leading-[22px]"
                >
                  {displayText}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="self-start max-w-[86%] px-4 py-3 rounded-lg rounded-bl-[4px] bg-surface-raised border border-line text-[15px] leading-[22px] text-ink"
                >
                  <span className="block font-bold text-[11px] leading-4 tracking-[1px] uppercase text-brand-ink mb-1">
                    AURA
                  </span>
                  {displayText}
                </div>
              );
            })}

            {busy && (
              <div
                aria-label="Aura sedang mengetik"
                className="self-start flex gap-1.5 px-4 py-3.5 rounded-lg rounded-bl-[4px] bg-surface-raised border border-line"
              >
                <i className="kln-typing-dot" />
                <i className="kln-typing-dot" />
                <i className="kln-typing-dot" />
              </div>
            )}
          </div>

          <div
            className="flex flex-wrap gap-2 px-5 pt-3.5 pb-2 border-t border-line"
            role="group"
            aria-label={t.auraSection.quickAria}
          >
            {(["q1", "q2", "q3", "q4"] as const).map((qKey) => (
              <button
                key={qKey}
                id={`aura-quick-${qKey}`}
                type="button"
                disabled={busy}
                onClick={() => handleQuickQuestion(qKey)}
                className="min-h-[38px] px-3.5 rounded-pill border-[1.5px] border-line-strong bg-surface-raised text-ink hover:bg-brand-soft disabled:opacity-55 font-semibold text-[13px] leading-none transition-colors cursor-pointer"
              >
                {t.auraSection[qKey]}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSendText}
            className="flex gap-2 px-5 py-2.5 items-center"
          >
            <input
              id="aura-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.auraSection.inputPlaceholder}
              aria-label={t.auraSection.inputPlaceholder}
              className="flex-1 min-w-0 min-h-[44px] px-3.5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink text-[15px] placeholder:text-ink-muted"
            />
            <button
              id="aura-chat-send"
              type="submit"
              disabled={busy || !input.trim()}
              className="min-h-[44px] px-4 rounded-md bg-brand text-on-brand hover:bg-brand-hover disabled:opacity-55 font-bold text-sm cursor-pointer transition-colors"
            >
              {t.auraSection.sendBtn}
            </button>
          </form>

          <p className="px-5 pb-4 pt-1 text-xs leading-4 text-ink-muted m-0">
            {t.auraSection.chatFoot}
          </p>
        </div>
      </div>
    </section>
  );
}
