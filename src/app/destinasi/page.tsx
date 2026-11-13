import React, { Suspense } from "react";
import { DestinationsView } from "@/components/DestinationsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "500+ Universitas Mitra di 7 Negara — KLN (Kampus Luar Negeri)",
  description:
    "Telusuri daftar 527 universitas mitra jaringan KLN di Amerika Serikat, Inggris, Australia, Kanada, Selandia Baru, Irlandia, dan Malaysia.",
};

export default function DestinasiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-100" />}>
      <DestinationsView />
    </Suspense>
  );
}
