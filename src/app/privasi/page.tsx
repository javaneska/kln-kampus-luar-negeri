import React from 'react';
import { LegalView } from '@/components/LegalView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — KLN (Kampus Luar Negeri)',
  description:
    'Kebijakan Privasi layanan KLN (Kampus Luar Negeri) di bawah PT Talenta Nusantara Advisory sesuai UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022).',
};

export default function PrivasiPage() {
  return <LegalView docType="privacy" />;
}
