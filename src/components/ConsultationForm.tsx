"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { DESTINATIONS } from "@/data/destinations";

export function ConsultationForm() {
  const { lang, t, shortlist } = useApp();
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [mail, setMail] = useState("");
  const [level, setLevel] = useState("s1");
  const [country, setCountry] = useState("");
  const [plan, setPlan] = useState("");
  const [consent, setConsent] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    wa?: string;
    mail?: string;
    consent?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [waHandoffUrl, setWaHandoffUrl] = useState("https://wa.me/16026005671");
  const [okShown, setOkShown] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (shortlist.length > 0 && !country) {
      const names = shortlist
        .map((code) => DESTINATIONS.find((d) => d.key === code)?.name[lang])
        .filter(Boolean)
        .join(", ");
      setCountry(names);
    }
  }, [shortlist, lang, country]);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t.formSection.eReq;
    if (!wa.trim()) {
      next.wa = t.formSection.eReq;
    } else if (!/^\+?[0-9 ()\-]{8,18}$/.test(wa.trim())) {
      next.wa = t.formSection.eWa;
    }
    if (!mail.trim()) {
      next.mail = t.formSection.eReq;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.trim())) {
      next.mail = t.formSection.eMail;
    }
    if (!consent) {
      next.consent = t.formSection.eConsent;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const levelLabel =
      level === "s1"
        ? t.formSection.oS1
        : level === "s2"
        ? t.formSection.oS2
        : level === "s3"
        ? t.formSection.oS3
        : t.formSection.oUnsure;

    const lines =
      lang === "en"
        ? [
            "Hello KLN, I would like to schedule a consultation.",
            `Name: ${name.trim()}`,
            `WhatsApp: ${wa.trim()}`,
            `Email: ${mail.trim()}`,
            `Study level: ${levelLabel}`,
          ]
        : [
            "Halo KLN, saya ingin menjadwalkan konsultasi.",
            `Nama: ${name.trim()}`,
            `WhatsApp: ${wa.trim()}`,
            `Email: ${mail.trim()}`,
            `Jenjang yang diminati: ${levelLabel}`,
          ];

    if (country.trim()) {
      lines.push(
        `${lang === "en" ? "Country of interest" : "Negara yang diminati"}: ${country.trim()}`
      );
    }
    if (plan.trim()) {
      lines.push(
        `${lang === "en" ? "Plan & questions" : "Rencana dan pertanyaan"}: ${plan.trim()}`
      );
    }

    const msgText = lines.join("\n");
    setSummaryText(msgText);
    const defaultWaUrl = `https://wa.me/16026005671?text=${encodeURIComponent(
      msgText
    )}`;
    setWaHandoffUrl(defaultWaUrl);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          wa,
          mail,
          level: levelLabel,
          country,
          plan,
          consent,
          lang,
        }),
      });
      const data = await res.json();
      if (data?.whatsappUrl) {
        setWaHandoffUrl(data.whatsappUrl);
      }
    } catch {
      // Fallback WhatsApp URL if offline
    } finally {
      setSubmitting(false);
      setSubmittedName(name.trim().split(/\s+/)[0]);
      setOkShown(true);
    }
  };

  const handleCopySummary = () => {
    try {
      navigator.clipboard.writeText(summaryText);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 1500);
    } catch {}
  };

  const handleReset = () => {
    setOkShown(false);
    setName("");
    setWa("");
    setMail("");
    setPlan("");
    setConsent(false);
    setErrors({});
  };

  return (
    <section className="sec consult" id="konsultasi">
      <div className="wrap form-in">
        <div className="form-copy">
          <p className="eyebrow">{t.formSection.eyebrow}</p>
          <h2 className="h2">{t.formSection.title}</h2>
          <p className="lead">{t.formSection.lead}</p>
          <ul className="ticks">
            {[t.formSection.b1, t.formSection.b2].map((b, idx) => (
              <li key={idx}>
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
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="formcard">
          {!okShown ? (
            <form id="form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="f-name">{t.formSection.lName}</label>
                <input
                  className="in"
                  id="f-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="err" id="e-name">
                    <span aria-hidden="true">!</span>
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div className="grid2">
                <div className="field">
                  <label htmlFor="f-wa">{t.formSection.lWa}</label>
                  <input
                    className="in"
                    id="f-wa"
                    name="wa"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0812 0000 0000"
                    required
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    aria-invalid={Boolean(errors.wa)}
                  />
                  {errors.wa && (
                    <p className="err" id="e-wa">
                      <span aria-hidden="true">!</span>
                      <span>{errors.wa}</span>
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="f-mail">{t.formSection.lMail}</label>
                  <input
                    className="in"
                    id="f-mail"
                    name="mail"
                    type="email"
                    autoComplete="email"
                    placeholder={t.formSection.phMail}
                    required
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    aria-invalid={Boolean(errors.mail)}
                  />
                  {errors.mail && (
                    <p className="err" id="e-mail">
                      <span aria-hidden="true">!</span>
                      <span>{errors.mail}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label htmlFor="f-level">{t.formSection.lLevel}</label>
                  <select
                    className="in"
                    id="f-level"
                    name="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="s1">{t.formSection.oS1}</option>
                    <option value="s2">{t.formSection.oS2}</option>
                    <option value="s3">{t.formSection.oS3}</option>
                    <option value="unsure">{t.formSection.oUnsure}</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="f-country">{t.formSection.lCountry}</label>
                  <input
                    className="in"
                    id="f-country"
                    name="country"
                    type="text"
                    placeholder={t.formSection.phCountry}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="f-plan">{t.formSection.lPlan}</label>
                <textarea
                  className="in"
                  id="f-plan"
                  name="plan"
                  placeholder={t.formSection.phPlan}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                />
                <p className="help" id="h-plan">
                  {t.formSection.hPlan}
                </p>
              </div>

              <div className="field">
                <label className="consent" htmlFor="f-consent">
                  <input
                    id="f-consent"
                    name="consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    {t.formSection.cText}{" "}
                    <Link href={t.footer.privacyUrl}>
                      {t.formSection.cLink}
                    </Link>
                    {t.formSection.cAnd}
                    <Link href={t.footer.termsUrl}>
                      {t.formSection.cTerms}
                    </Link>
                    .
                  </span>
                </label>
                <p className="help" id="h-consent">
                  {t.formSection.cUnder18}
                </p>
                {errors.consent && (
                  <p className="err" id="e-consent">
                    <span aria-hidden="true">!</span>
                    <span>{errors.consent}</span>
                  </p>
                )}
              </div>

              <button
                id="form-submit-btn"
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                <span>
                  {submitting ? t.formSection.submitting : t.formSection.submit}
                </span>
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
              </button>
            </form>
          ) : (
            <div className="ok" id="ok" role="status" aria-live="polite">
              <span className="badge" aria-hidden="true">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h3 id="ok-title">
                {lang === "en"
                  ? `Ready to send, ${submittedName}.`
                  : `Ringkasan siap dikirim, ${submittedName}.`}
              </h3>
              <p id="ok-body">
                {lang === "en"
                  ? "Press the WhatsApp button below to send this summary to a KLN advisor."
                  : "Tekan tombol WhatsApp di bawah untuk mengirim ringkasan ini ke konselor KLN."}
              </p>
              <pre className="ok-msg" id="ok-msg">
                {summaryText}
              </pre>
              <div className="prow">
                <a
                  className="btn btn-primary"
                  id="ok-wa"
                  href={waHandoffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.formSection.okWa}
                </a>
                <button
                  type="button"
                  className="btn btn-secondary"
                  id="ok-copy"
                  onClick={handleCopySummary}
                >
                  {copiedMsg
                    ? t.footer.copied
                    : lang === "en"
                    ? "Copy message"
                    : "Salin isi pesan"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  id="again"
                  onClick={handleReset}
                >
                  {t.formSection.again}
                </button>
              </div>
              <p className="help" id="ok-note">
                {lang === "en"
                  ? "Prefer email? Copy the message above and send it to info@kampusluarnegeri.com."
                  : "Lebih nyaman lewat email? Salin isi pesan di atas lalu kirim ke info@kampusluarnegeri.com."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
