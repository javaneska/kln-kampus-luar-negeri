import React from 'react';
import { LegalView } from '@/components/LegalView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat Penggunaan — KLN (Kampus Luar Negeri)',
  description:
    'Syarat Penggunaan situs dan layanan konsultasi KLN (Kampus Luar Negeri) di bawah PT Talenta Nusantara Advisory.',
};

export default function SyaratPage() {
  return <LegalView docType="terms" />;
}
