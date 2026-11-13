import React from 'react';
import { FaqView } from '@/components/FaqView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pertanyaan yang Sering Diajukan (FAQ) — KLN (Kampus Luar Negeri)',
  description:
    'Jawaban transparan atas 22 pertanyaan umum seputar layanan gratis KLN, struktur kemitraan TNA Group / Aspectama / GRID, pendaftaran kampus, dan visa pelajar.',
};

export default function FaqPage() {
  return <FaqView />;
}
