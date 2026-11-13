'use client';

import React, { Suspense, useEffect } from 'react';
import { DestinationsView } from '@/components/DestinationsView';
import { useApp } from '@/context/AppContext';

export default function EnDestinationsPage() {
  const { setLang } = useApp();
  useEffect(() => {
    setLang('en');
  }, [setLang]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-kln-bg" />}>
      <DestinationsView />
    </Suspense>
  );
}
