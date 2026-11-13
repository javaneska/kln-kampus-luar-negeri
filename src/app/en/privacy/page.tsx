'use client';

import React, { useEffect } from 'react';
import { LegalView } from '@/components/LegalView';
import { useApp } from '@/context/AppContext';

export default function EnPrivacyPage() {
  const { setLang } = useApp();
  useEffect(() => {
    setLang('en');
  }, [setLang]);

  return <LegalView docType="privacy" />;
}
