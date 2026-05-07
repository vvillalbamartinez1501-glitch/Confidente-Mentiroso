'use client';

import { useGlobalContext } from '../context/GlobalContext';
import { Player, GameSecret, ScoringMode, GameState as Phase } from '../lib/types';

/**
 * Unified Game State Hook
 * Acts as an abstraction layer between Local and Online modes.
 */
export function useGameState() {
  const context = useGlobalContext();
  const { activeSession, isHost } = context;
  const isOnline = activeSession?.connectionMode === 'ONLINE';

  // Current State Abstraction
  const players: Player[] = isOnline ? context.onlinePlayers : (activeSession?.players || []);
  const onlineGameState = context.onlineGameState || {};

  // Actions
  const updatePlayers = async (newPlayers: Player[]) => {
    // Both modes use the same context method which handles the underlying storage
    context.updateActiveSessionPlayers(newPlayers);
  };

  const updateScoring = (mode: ScoringMode) => {
    context.updateActiveSessionScoring(mode);
  };

  const updateGameState = async (newState: any) => {
    if (isOnline) {
      if (!isHost) return;
      await context.updateGameState(newState);
    } else {
      // Local management is handled by the local useGameLogic state
    }
  };

  const kickPlayer = async (playerId: string) => {
    if (isOnline) {
      if (!isHost) return;
      await context.kickPlayer(playerId);
    } else {
      context.updateActiveSessionPlayers(players.filter(p => p.id !== playerId));
    }
  };

  return {
    isOnline,
    isHost,
    players,
    onlineGameState,
    activeSession,
    playerId: context.playerId,
    onlineError: context.onlineError,
    updatePlayers,
    updateScoring,
    updateGameState,
    kickPlayer,
    createRoom: context.createRoom,
    joinRoom: context.joinRoom,
    leaveRoom: context.leaveRoom,
  };
}
