"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useApp } from "@/context/AppContext";

export default function NotFound() {
  const { lang } = useApp();
  return (
    <div>
      <Navbar />
      <main id="top">
        <section className="nf">
          <div className="wrap">
            <p className="eyebrow">404</p>
            <h1>
              {lang === "en"
                ? "Page not found."
                : "Halaman tidak ditemukan."}
            </h1>
            <p className="lead">
              {lang === "en"
                ? "The page you are looking for may have moved or the address is incorrect."
                : "Halaman yang kamu cari mungkin sudah berpindah atau alamatnya kurang tepat."}
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/">
                {lang === "en"
                  ? "Return to Indonesian home"
                  : "Kembali ke beranda"}
              </Link>
              <Link className="btn btn-secondary" href="/en">
                Go to English home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
