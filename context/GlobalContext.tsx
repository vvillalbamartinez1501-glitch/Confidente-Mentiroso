'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';
import { Session, Player, ScoringMode } from '../lib/types';

interface GlobalContextType {
  sessions: Session[];
  activeSession: Session | null;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (name: string) => Session;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  updateActiveSessionPlayers: (players: Player[]) => void;
  updateActiveSessionScoring: (scoringMode: ScoringMode) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const sessionManager = useSessionManager();

  return (
    <GlobalContext.Provider value={sessionManager}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}
