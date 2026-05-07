'use client';

import { useState, useEffect } from 'react';
import { Session, Player, ScoringMode, ConnectionMode } from '../lib/types';

const SESSIONS_STORAGE_KEY = 'confidente_mentiroso_sessions';

export function useSessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load all sessions
  useEffect(() => {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const createSession = (name: string, mode: ConnectionMode = 'LOCAL', roomCode?: string, isHost: boolean = true) => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      players: mode === 'LOCAL' ? [
        { id: crypto.randomUUID(), name: 'Adivino', score: 0, hp: 5, isEliminated: false, isManualSpectator: false },
        { id: crypto.randomUUID(), name: 'Jugador 2', score: 0, hp: 5, isEliminated: false, isManualSpectator: false },
        { id: crypto.randomUUID(), name: 'Jugador 3', score: 0, hp: 5, isEliminated: false, isManualSpectator: false },
      ] : [],
      scoringMode: 'ORIGINAL',
      connectionMode: mode,
      roomCode: roomCode,
      isHost: isHost
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession;
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates, lastPlayed: new Date().toISOString() } : s
    ));
  };

  const updateActiveSessionPlayers = (players: Player[]) => {
    if (!activeSessionId) return;
    updateSession(activeSessionId, { players });
  };

  const updateActiveSessionScoring = (scoringMode: ScoringMode) => {
    if (!activeSessionId) return;
    updateSession(activeSessionId, { scoringMode });
  };


  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    updateSession,
    updateActiveSessionPlayers,
    updateActiveSessionScoring
  };
}
