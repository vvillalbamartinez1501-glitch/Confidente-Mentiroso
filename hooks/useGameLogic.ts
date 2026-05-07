'use client';

import { useState, useEffect } from 'react';
import { GameState, GameMode, ScoringMode, Role, Player, PlayerRole, GameSecret } from '../lib/types';
import { getRandomSecret } from '../lib/contentManager';
import { useScoreManager } from './useScoreManager';
import { useGameState } from './useGameState';

// Robust Fisher-Yates Shuffle Algorithm
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function useGameLogic() {
  const { 
    isOnline, isHost, players, onlineGameState, 
    updatePlayers, updateScoring, updateGameState, 
    activeSession 
  } = useGameState();

  const [gameState, setGameState] = useState<GameState>('home');
  const [gameMode, setGameMode] = useState<GameMode>('WORDS');
  const [categories, setCategories] = useState<string[]>([]);
  const [roundTime, setRoundTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentSecret, setCurrentSecret] = useState<GameSecret | null>(null);
  const [roles, setRoles] = useState<PlayerRole[]>([]);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoles, setShowRoles] = useState(false);

  const scoreManager = useScoreManager(
    players,
    updatePlayers,
    5 // Default initial HP
  );

  // Sync state if online (Guest or Host receiving updates)
  useEffect(() => {
    if (isOnline && onlineGameState) {
      const state = onlineGameState;
      if (state.phase) setGameState(state.phase as GameState);
      if (state.mode) setGameMode(state.mode as GameMode);
      if (state.categories) setCategories(state.categories);
      if (state.secret) setCurrentSecret(state.secret);
      if (state.roles) setRoles(state.roles);
      if (state.votedPlayerId !== undefined) setVotedPlayerId(state.votedPlayerId);
      if (state.roundTime) setRoundTime(state.roundTime);
      if (state.timeLeft !== undefined) setTimeLeft(state.timeLeft);
      if (state.showRoles !== undefined) setShowRoles(state.showRoles);
    }
  }, [isOnline, onlineGameState]);

  // Unified state update function
  const pushState = (updates: any) => {
    if (isOnline && isHost) {
      updateGameState({
        phase: gameState,
        mode: gameMode,
        categories,
        secret: currentSecret,
        roles,
        votedPlayerId,
        roundTime,
        timeLeft,
        showRoles,
        ...updates
      });
    }
  };

  const updatePhase = (newPhase: GameState, extra?: any) => {
    setGameState(newPhase);
    pushState({ phase: newPhase, ...extra });
  };

  const toggleShowRoles = (val: boolean) => {
    setShowRoles(val);
    pushState({ showRoles: val });
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

  const startGameSetup = () => updatePhase('session_select');
  const goToGroupManage = () => updatePhase('group_manage');
  
  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    updatePhase('setup', { mode });
  };

  const selectScoring = (mode: ScoringMode) => {
    updateScoring(mode);
    updatePhase('mode_select');
  };

  const toggleCategory = (cat: string) => {
    const newCats = categories.includes(cat) ? categories.filter(c => c !== cat) : [...categories, cat];
    setCategories(newCats);
    pushState({ categories: newCats });
  };

  const startRound = async () => {
    if (!activeSession) return;
    if (isOnline && !isHost) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const secret = await getRandomSecret(gameMode, categories);
      const alivePlayers = players.filter((p: Player) => !p.isEliminated);
      const activePlayers = alivePlayers.filter((p: Player) => !p.isManualSpectator);
      
      if (activePlayers.length < 3) {
        alert("Necesitas al menos 3 jugadores activos.");
        setIsLoading(false);
        return;
      }

      const shuffledActive = shuffleArray<Player>(activePlayers);
      const diviner = shuffledActive[0] as Player;
      const confidant = shuffledActive[1] as Player;
      const liar = shuffledActive[2] as Player;

      const assignedRoles: PlayerRole[] = players.map((p: Player) => {
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
      setCurrentSecret(secret);
      setTimeLeft(roundTime);
      
      updatePhase('assignment', { 
        secret, 
        roles: assignedRoles, 
        timeLeft: roundTime,
        votedPlayerId: null,
        showRoles: false
      });
    } catch (e) {
      console.error("Error starting round:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const beginPlay = () => updatePhase('playing');
  const goToVoting = () => updatePhase('voting');

  const submitVote = (targetPlayerId: string) => {
    setVotedPlayerId(targetPlayerId);
    
    const diviner = roles.find(r => r.role === 'Adivino')!;
    const liar = roles.find(r => r.role === 'Mentiroso')!;
    
    scoreManager.applyRoundResults(
      diviner.playerId,
      liar.playerId,
      targetPlayerId,
      activeSession.scoringMode
    );
    
    updatePhase('result', { votedPlayerId: targetPlayerId });
  };

  const nextRound = () => {
    const alive = players?.filter((p: Player) => !p.isEliminated) || [];
    if (activeSession?.scoringMode === 'MUERTE' && alive.length < 3) {
      updatePhase('game_over');
    } else {
      startRound();
    }
  };

  const resetGame = () => {
    setRoles([]);
    setCurrentSecret(null);
    setVotedPlayerId(null);
    setShowRoles(false);
    updatePhase('home', { 
      secret: null, 
      roles: [], 
      votedPlayerId: null,
      showRoles: false
    });
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
    players,
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
    scoringMode: activeSession?.scoringMode || 'ORIGINAL',
    updatePlayers
  };
}
