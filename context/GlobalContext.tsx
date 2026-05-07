'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';
import { useOnlineManager } from '../hooks/useOnlineManager';
import { Session, Player, ScoringMode, ConnectionMode } from '../lib/types';

interface GlobalContextType {
  sessions: Session[];
  activeSession: Session | null;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (name: string, mode?: ConnectionMode, roomCode?: string, isHost?: boolean) => Session;
  deleteSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  updateActiveSessionPlayers: (players: Player[]) => void;
  updateActiveSessionScoring: (scoringMode: ScoringMode) => void;
  
  // Online Online State
  onlineRoomCode: string | null;
  isHost: boolean;
  onlinePlayers: Player[];
  onlineGameState: any;
  onlineError: string | null;
  playerId: string | null;
  createRoom: (hostName: string) => Promise<any>;
  joinRoom: (code: string, playerName: string) => Promise<any>;
  kickPlayer: (playerId: string) => Promise<void>;
  updateGameState: (newState: any) => Promise<void>;
  leaveRoom: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const sessionManager = useSessionManager();
  const onlineManager = useOnlineManager();

  const value = {
    ...sessionManager,
    onlineRoomCode: onlineManager.roomCode,
    isHost: onlineManager.isHost,
    onlinePlayers: onlineManager.onlinePlayers,
    onlineGameState: onlineManager.gameState,
    onlineError: onlineManager.error,
    playerId: onlineManager.playerId,
    createRoom: onlineManager.createRoom,
    joinRoom: onlineManager.joinRoom,
    kickPlayer: onlineManager.kickPlayer,
    updateGameState: onlineManager.updateGameState,
    leaveRoom: onlineManager.leaveRoom,
  };

  return (
    <GlobalContext.Provider value={value}>
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
