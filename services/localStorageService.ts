import { Session, Player, ScoringMode } from '../lib/types';

const SESSIONS_STORAGE_KEY = 'confidente_mentiroso_sessions';

export const localStorageService = {
  getSessions(): Session[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse sessions", e);
      return [];
    }
  },

  saveSessions(sessions: Session[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  },

  updateSession(sessions: Session[], id: string, updates: Partial<Session>): Session[] {
    return sessions.map(s => 
      s.id === id ? { ...s, ...updates, lastPlayed: new Date().toISOString() } : s
    );
  }
};
