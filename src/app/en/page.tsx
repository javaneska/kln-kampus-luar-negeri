import React from 'react';
import { HomeView } from '@/components/HomeView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KLN — Kampus Luar Negeri | One plan, campuses around the world.',
  description:
    'KLN helps Indonesian students plan undergraduate, postgraduate, language, and pathway study abroad across 500+ partner universities in 7 countries — at no consultation cost to students.',
};

export default function EnHomePage() {
  return <HomeView initialLang="en" />;
}
