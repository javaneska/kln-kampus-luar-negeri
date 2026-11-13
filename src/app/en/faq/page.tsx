'use client';

import React, { useEffect } from 'react';
import { FaqView } from '@/components/FaqView';
import { useApp } from '@/context/AppContext';

export default function EnFaqPage() {
  const { setLang } = useApp();
  useEffect(() => {
    setLang('en');
  }, [setLang]);

  return <FaqView />;
}
