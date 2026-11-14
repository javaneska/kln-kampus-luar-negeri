"use client";

import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  quickKey?: "q1" | "q2" | "q3" | "q4";
  showCounselorBtn?: boolean;
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
        showCounselorBtn: qKey === "q2" || qKey === "q4",
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
      const rawReply = data?.reply || t.auraSection.quickDialogs.q1[1];
      const hasCounselorTag = /\[KONSELOR\]/i.test(rawReply);
      const cleanReply = rawReply.replace(/\[KONSELOR\]/gi, "").trim();

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: cleanReply,
          showCounselorBtn: hasCounselorTag,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: t.auraSection.quickDialogs.q4[1],
          showCounselorBtn: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sec" id="aura">
      <div className="wrap aura-in">
        <div className="aura-copy">
          <p className="eyebrow">{t.auraSection.eyebrow}</p>
          <h2 className="h2">{t.auraSection.title}</h2>
          <p className="lead">{t.auraSection.body}</p>
          <ul className="ticks">
            {[t.auraSection.b1, t.auraSection.b2, t.auraSection.b3].map(
              (bullet, i) => (
                <li key={i}>
                  <svg
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

        <div className="chat" id="aura-chat-window">
          <div className="chat-h">
            <span className="avatar" aria-hidden="true">
              A
            </span>
            <div>
              <strong>Aura</strong>
              <small>{t.auraSection.chatSub}</small>
            </div>
            <span className="tag">{t.auraSection.chatTag}</span>
          </div>

          <div
            ref={logRef}
            className="log"
            id="log"
            role="log"
            aria-live="polite"
            aria-label="Percakapan dengan Aura"
          >
            <div className="msg a still">
              <span className="sr">Aura: </span>
              {t.auraSection.chatIntro}
            </div>

            {messages.map((m) => {
              const displayText = m.quickKey
                ? t.auraSection.quickDialogs[m.quickKey][
                    m.role === "user" ? 0 : 1
                  ]
                : m.text;
              return m.role === "user" ? (
                <div key={m.id} className="msg u">
                  <span className="sr">
                    {lang === "en" ? "You: " : "Kamu: "}
                  </span>
                  {displayText}
                </div>
              ) : (
                <React.Fragment key={m.id}>
                  <div className="msg a">
                    <span className="sr">Aura: </span>
                    {displayText}
                  </div>
                  {m.showCounselorBtn && (
                    <a
                      className="btn btn-primary btn-sm chat-wa"
                      href="https://wa.me/16026005671"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lang === "en"
                        ? "Continue with a KLN advisor on WhatsApp"
                        : "Lanjut ke konselor KLN di WhatsApp"}
                    </a>
                  )}
                </React.Fragment>
              );
            })}

            {busy && (
              <div
                className="typing"
                aria-label={
                  lang === "en" ? "Aura is typing" : "Aura sedang mengetik"
                }
              >
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          <div
            className="quick"
            id="quick"
            role="group"
            aria-label={t.auraSection.quickAria}
          >
            {(["q1", "q2", "q3", "q4"] as const).map((qKey) => (
              <button
                key={qKey}
                id={`aura-quick-${qKey}`}
                type="button"
                data-q={qKey}
                disabled={busy}
                onClick={() => handleQuickQuestion(qKey)}
              >
                {t.auraSection[qKey]}
              </button>
            ))}
          </div>

          <form className="chat-in" id="chat-in" onSubmit={handleSendText}>
            <input
              id="chat-q"
              type="text"
              maxLength={500}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.auraSection.inputPlaceholder}
              aria-label={t.auraSection.inputPlaceholder}
              disabled={busy}
            />
            <button
              id="aura-chat-send"
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={busy || !input.trim()}
            >
              {t.auraSection.sendBtn}
            </button>
          </form>

          <p className="chat-f">{t.auraSection.chatFoot}</p>
        </div>
      </div>
    </section>
  );
}
