"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CountryCode } from "@/data/unis";
import { Language, TRANSLATIONS } from "@/data/i18n";

export type { Language, Language as Lang };

interface AppContextType {
  lang: Language;
  setLang: (next: Language) => void;
  t: typeof TRANSLATIONS.id;
  theme: "light" | "dark";
  toggleTheme: () => void;
  shortlist: CountryCode[];
  toggleShortlist: (code: CountryCode) => void;
  clearShortlist: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({
  children,
  initialLang = "id",
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [shortlist, setShortlist] = useState<CountryCode[]>([]);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("kln-lang") as Language | null;
      if (window.location.pathname.startsWith("/en")) {
        setLangState("en");
        document.documentElement.lang = "en";
      } else if (savedLang === "id" || savedLang === "en") {
        setLangState(savedLang);
        document.documentElement.lang = savedLang;
      } else {
        document.documentElement.lang = initialLang;
      }

      const savedTheme = localStorage.getItem("kln-theme") as "light" | "dark" | null;
      const prefersDark =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const activeTheme =
        savedTheme === "dark" || savedTheme === "light"
          ? savedTheme
          : prefersDark
          ? "dark"
          : "light";
      setTheme(activeTheme);
      document.documentElement.setAttribute("data-theme", activeTheme);

      const savedShort = localStorage.getItem("kln-shortlist");
      if (savedShort) {
        const parsed = JSON.parse(savedShort);
        if (Array.isArray(parsed)) setShortlist(parsed);
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, [initialLang]);

  const setLang = (next: Language) => {
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
    try {
      localStorage.setItem("kln-lang", next);
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
    }
    try {
      localStorage.setItem("kln-theme", next);
    } catch {}
  };

  const toggleShortlist = (code: CountryCode) => {
    setShortlist((prev) => {
      const next = prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code];
      try {
        localStorage.setItem("kln-shortlist", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearShortlist = () => {
    setShortlist([]);
    try {
      localStorage.removeItem("kln-shortlist");
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t: TRANSLATIONS[lang],
        theme,
        toggleTheme,
        shortlist,
        toggleShortlist,
        clearShortlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
