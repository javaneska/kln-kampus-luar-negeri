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
  const [waHandoffUrl, setWaHandoffUrl] = useState("https://wa.me/16026005671");
  const [okShown, setOkShown] = useState(false);

  // Sync shortlisted countries into the country field if user hasn't typed custom text
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
    <section id="konsultasi" className="py-16 md:py-20 bg-brand text-on-brand">
      <div className="max-w-[1160px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-14 items-start">
        <div className="grid gap-4">
          <p className="font-bold text-xs leading-4 tracking-[1px] uppercase text-sun">
            {t.formSection.eyebrow}
          </p>
          <h2 className="font-display font-extrabold text-[clamp(28px,4vw,40px)] leading-[1.15] tracking-[-0.6px]">
            {t.formSection.title}
          </h2>
          <p className="text-lg leading-7 opacity-90 max-w-[56ch]">
            {t.formSection.lead}
          </p>
          <ul className="list-none m-0 mt-2 p-0 grid gap-2.5">
            {[t.formSection.b1, t.formSection.b2].map((b, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <svg
                  className="flex-none mt-[3px] text-sun"
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

        <div className="bg-surface-raised text-ink rounded-xl p-6 sm:p-8 shadow-md">
          {!okShown ? (
            <form id="consultation-form" onSubmit={handleSubmit} noValidate className="grid gap-5">
              <div className="grid gap-1.5">
                <label htmlFor="f-name" className="font-semibold text-sm leading-5">
                  {t.formSection.lName}
                </label>
                <input
                  id="f-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-md border-[1.5px] bg-surface-raised text-ink text-base ${
                    errors.name ? "border-danger border-2" : "border-line-strong"
                  }`}
                />
                {errors.name && (
                  <p className="flex gap-1.5 items-start text-[13px] leading-[18px] text-danger font-semibold m-0">
                    <span aria-hidden="true">!</span>
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="grid gap-1.5">
                  <label htmlFor="f-wa" className="font-semibold text-sm leading-5">
                    {t.formSection.lWa}
                  </label>
                  <input
                    id="f-wa"
                    name="wa"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0812 0000 0000"
                    value={wa}
                    onChange={(e) => setWa(e.target.value)}
                    aria-invalid={Boolean(errors.wa)}
                    className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-md border-[1.5px] bg-surface-raised text-ink text-base placeholder:text-ink-muted ${
                      errors.wa ? "border-danger border-2" : "border-line-strong"
                    }`}
                  />
                  {errors.wa && (
                    <p className="flex gap-1.5 items-start text-[13px] leading-[18px] text-danger font-semibold m-0">
                      <span aria-hidden="true">!</span>
                      <span>{errors.wa}</span>
                    </p>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <label htmlFor="f-mail" className="font-semibold text-sm leading-5">
                    {t.formSection.lMail}
                  </label>
                  <input
                    id="f-mail"
                    name="mail"
                    type="email"
                    autoComplete="email"
                    placeholder={t.formSection.phMail}
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    aria-invalid={Boolean(errors.mail)}
                    className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-md border-[1.5px] bg-surface-raised text-ink text-base placeholder:text-ink-muted ${
                      errors.mail ? "border-danger border-2" : "border-line-strong"
                    }`}
                  />
                  {errors.mail && (
                    <p className="flex gap-1.5 items-start text-[13px] leading-[18px] text-danger font-semibold m-0">
                      <span aria-hidden="true">!</span>
                      <span>{errors.mail}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="grid gap-1.5">
                  <label htmlFor="f-level" className="font-semibold text-sm leading-5">
                    {t.formSection.lLevel}
                  </label>
                  <select
                    id="f-level"
                    name="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink text-base"
                  >
                    <option value="s1">{t.formSection.oS1}</option>
                    <option value="s2">{t.formSection.oS2}</option>
                    <option value="s3">{t.formSection.oS3}</option>
                    <option value="unsure">{t.formSection.oUnsure}</option>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <label htmlFor="f-country" className="font-semibold text-sm leading-5">
                    {t.formSection.lCountry}
                  </label>
                  <input
                    id="f-country"
                    name="country"
                    type="text"
                    placeholder={t.formSection.phCountry}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink text-base placeholder:text-ink-muted"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="f-plan" className="font-semibold text-sm leading-5">
                  {t.formSection.lPlan}
                </label>
                <textarea
                  id="f-plan"
                  name="plan"
                  placeholder={t.formSection.phPlan}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full min-h-[104px] px-3.5 py-2.5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink text-base placeholder:text-ink-muted resize-y"
                />
                <p className="text-[13px] leading-[18px] text-ink-muted m-0">
                  {t.formSection.hPlan}
                </p>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="f-consent"
                  className="flex gap-3 items-start text-sm leading-[22px] cursor-pointer"
                >
                  <input
                    id="f-consent"
                    name="consent"
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="flex-none w-6 h-6 m-0 accent-brand"
                  />
                  <span>
                    {t.formSection.cText}{" "}
                    <Link
                      href={t.footer.privacyUrl}
                      className="text-brand-ink underline underline-offset-2 font-semibold"
                    >
                      {t.formSection.cLink}
                    </Link>
                    {t.formSection.cAnd}
                    <Link
                      href={t.footer.termsUrl}
                      className="text-brand-ink underline underline-offset-2 font-semibold"
                    >
                      {t.formSection.cTerms}
                    </Link>
                    .
                  </span>
                </label>
                <p className="text-[13px] leading-[18px] text-ink-muted m-0">
                  {t.formSection.cUnder18}
                </p>
                {errors.consent && (
                  <p className="flex gap-1.5 items-start text-[13px] leading-[18px] text-danger font-semibold m-0">
                    <span aria-hidden="true">!</span>
                    <span>{errors.consent}</span>
                  </p>
                )}
              </div>

              <div>
                <button
                  id="form-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-md bg-brand text-on-brand hover:bg-brand-hover font-bold text-[15px] leading-none transition-all cursor-pointer"
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
              </div>
            </form>
          ) : (
            <div className="grid gap-4 justify-items-start" role="status" aria-live="polite">
              <span
                aria-hidden="true"
                className="grid place-items-center w-14 h-14 rounded-full bg-leaf-soft text-leaf-ink"
              >
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
              <h3 className="font-display font-extrabold text-[26px] leading-8 tracking-[-0.3px] text-ink">
                {t.formSection.okTitle(submittedName)}
              </h3>
              <p className="text-ink-muted">{t.formSection.okBody}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  id="form-wa-handoff"
                  href={waHandoffUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-md bg-brand text-on-brand hover:bg-brand-hover font-bold text-sm"
                >
                  {t.formSection.waDirect}
                </a>
                <button
                  id="form-reset-btn"
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-md border-[1.5px] border-line-strong bg-surface-raised text-ink hover:bg-brand-soft font-bold text-sm cursor-pointer"
                >
                  {t.formSection.again}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
