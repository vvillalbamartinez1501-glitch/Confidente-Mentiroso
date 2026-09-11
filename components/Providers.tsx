'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { GlobalProvider } from '../context/GlobalContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlobalProvider>
        {children}
      </GlobalProvider>
    </SessionProvider>
  );
}
