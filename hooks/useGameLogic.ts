'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameMode, ScoringMode, Role, Player, PlayerRole, GameSecret } from '../lib/types';
import { getRandomSecret } from '../lib/contentManager';
import { useScoreManager } from './useScoreManager';

export function useGameLogic(sessionManager: any) {
  const [gameState, setGameState] = useState<GameState>('home');
  const [gameMode, setGameMode] = useState<GameMode>('WORDS');
  const [categories, setCategories] = useState<string[]>([]);
  const [roundTime, setRoundTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentSecret, setCurrentSecret] = useState<GameSecret | null>(null);
  const [roles, setRoles] = useState<PlayerRole[]>([]);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOnline = sessionManager.activeSession?.connectionMode === 'ONLINE';
  const isHost = sessionManager.isHost;

  const scoreManager = useScoreManager(
    isOnline ? sessionManager.onlinePlayers : (sessionManager.activeSession?.players || []),
    sessionManager.updateActiveSessionPlayers,
    5 // Default initial HP
  );

  const [showRoles, setShowRoles] = useState(false);

  // Sync state if online
  useEffect(() => {
    if (isOnline && sessionManager.onlineGameState) {
      const state = sessionManager.onlineGameState;
      if (state.phase) setGameState(state.phase as GameState);
      if (state.mode) setGameMode(state.mode as GameMode);
      if (state.categories) setCategories(state.categories);
      if (state.secret) setCurrentSecret(state.secret);
      if (state.roles) setRoles(state.roles);
      if (state.votedPlayerId) setVotedPlayerId(state.votedPlayerId);
      if (state.roundTime) setRoundTime(state.roundTime);
      if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft);
      if (state.showRoles !== undefined) setShowRoles(state.showRoles);
    }
  }, [isOnline, sessionManager.onlineGameState]);

  // Wrapped state updates for Host
  const updateStateAndPush = (newPhase: GameState, extra?: any) => {
    setGameState(newPhase);
    if (isOnline && isHost) {
      sessionManager.updateGameState({
        phase: newPhase,
        mode: gameMode,
        categories,
        secret: currentSecret,
        roles,
        votedPlayerId,
        roundTime,
        timeLeft,
        showRoles,
        ...extra
      });
    }
  };

  const toggleShowRoles = (val: boolean) => {
    setShowRoles(val);
    if (isOnline && isHost) {
      sessionManager.updateGameState({ showRoles: val });
    }
  };



  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && roundTime !== Infinity) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (!isOnline || isHost) goToVoting();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, roundTime, isOnline, isHost]);

  const startGameSetup = () => updateStateAndPush('session_select');
  
  const goToGroupManage = () => updateStateAndPush('group_manage');
  
  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    updateStateAndPush('setup', { mode });
  };

  const selectScoring = (mode: ScoringMode) => {
    sessionManager.updateActiveSessionScoring(mode);
    updateStateAndPush('mode_select');
  };

  const toggleCategory = (cat: string) => {
    const newCats = categories.includes(cat) ? categories.filter(c => c !== cat) : [...categories, cat];
    setCategories(newCats);
    if (isOnline && isHost) pushState({ categories: newCats });
  };

  const startRound = async () => {
    if (!sessionManager.activeSession) return;
    setIsLoading(true);
    try {
      const secret = await getRandomSecret(gameMode, categories);
      setCurrentSecret(secret);
      
      const allPlayers = isOnline ? sessionManager.onlinePlayers : sessionManager.activeSession.players;
      const alivePlayers = allPlayers.filter((p: Player) => !p.isEliminated);
      const activePlayers = alivePlayers.filter((p: Player) => !p.isManualSpectator);
      
      if (activePlayers.length < 3) {
        alert("Necesitas al menos 3 jugadores activos (vivos y no marcados como espectadores).");
        setIsLoading(false);
        return;
      }

      // Randomize active players
      const shuffledActive = [...activePlayers].sort(() => Math.random() - 0.5);
      const diviner = shuffledActive[0];
      const confidant = shuffledActive[1];
      const liar = shuffledActive[2];

      const assignedRoles: PlayerRole[] = allPlayers.map((p: Player) => {
        let role: Role = 'Espectador';
        if (p.id === diviner.id) role = 'Adivino';
        else if (p.id === confidant.id) role = 'Confidente';
        else if (p.id === liar.id) role = 'Mentiroso';
        
        return {
          playerId: p.id,
          player: p.name,
          role,
          isManualSpectator: p.isManualSpectator
        };
      });

      setRoles(assignedRoles);
      setTimeLeft(roundTime);
      updateStateAndPush('assignment', { secret, roles: assignedRoles, timeLeft: roundTime });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const beginPlay = () => updateStateAndPush('playing');
  
  const goToVoting = () => updateStateAndPush('voting');

  const submitVote = (targetPlayerId: string) => {
    setVotedPlayerId(targetPlayerId);
    
    const diviner = roles.find(r => r.role === 'Adivino')!;
    const liar = roles.find(r => r.role === 'Mentiroso')!;
    
    scoreManager.applyRoundResults(
      diviner.playerId,
      liar.playerId,
      targetPlayerId,
      sessionManager.activeSession!.scoringMode
    );
    
    updateStateAndPush('result', { votedPlayerId: targetPlayerId });
  };

  const nextRound = () => {
    const alive = (isOnline ? sessionManager.onlinePlayers : sessionManager.activeSession?.players).filter((p: Player) => !p.isEliminated) || [];
    if (sessionManager.activeSession?.scoringMode === 'MUERTE' && alive.length < 3) {
      updateStateAndPush('game_over');
    } else {
      startRound();
    }
  };

  const resetGame = () => {
    updateStateAndPush('home', { secret: null, roles: [], votedPlayerId: null });
  };

  return {
    gameState,
    setGameState,
    gameMode,
    categories,
    roundTime,
    timeLeft,
    currentSecret,
    roles,
    votedPlayerId,
    isLoading,
    isOnline,
    isHost,
    showRoles,
    toggleShowRoles,
    sessionManager,
    scoreManager,
    startGameSetup,
    goToGroupManage,
    selectMode,
    selectScoring,
    toggleCategory,
    setRoundTime,
    startRound,
    beginPlay,
    goToVoting,
    submitVote,
    nextRound,
    resetGame,
    scoringMode: sessionManager.activeSession?.scoringMode || 'ORIGINAL'
  };
}

