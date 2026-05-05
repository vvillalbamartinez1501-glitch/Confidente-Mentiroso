'use client';

import { useState, useEffect } from 'react';
import { GameState, GameMode, ScoringMode, Role, Player, PlayerRole, GameSecret } from '../lib/types';
import { getRandomSecret } from '../lib/contentManager';
import { useSessionManager } from './useSessionManager';
import { useScoreManager } from './useScoreManager';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [gameMode, setGameMode] = useState<GameMode>('WORDS');
  const [categories, setCategories] = useState<string[]>([]);
  const [roundTime, setRoundTime] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentSecret, setCurrentSecret] = useState<GameSecret | null>(null);
  const [roles, setRoles] = useState<PlayerRole[]>([]);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const sessionManager = useSessionManager();
  const scoreManager = useScoreManager(
    sessionManager.activeSession?.players || [],
    sessionManager.updateActiveSessionPlayers,
    5 // Default initial HP
  );

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && roundTime !== Infinity) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      goToVoting();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, roundTime]);

  const startGameSetup = () => setGameState('session_select');
  
  const goToGroupManage = () => setGameState('group_manage');
  
  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('setup');
  };

  const selectScoring = (mode: ScoringMode) => {
    sessionManager.updateActiveSessionScoring(mode);
    setGameState('mode_select');
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const startRound = async () => {
    if (!sessionManager.activeSession) return;
    setIsLoading(true);
    try {
      const secret = await getRandomSecret(gameMode, categories);
      setCurrentSecret(secret);
      
      const players = sessionManager.activeSession.players.filter(p => !p.isEliminated);
      if (players.length < 3) {
        alert("Necesitas al menos 3 jugadores vivos.");
        setIsLoading(false);
        return;
      }

      // Randomize roles
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const diviner = shuffled[0];
      const confidant = shuffled[1];
      const liar = shuffled[2];
      const others = shuffled.slice(3);

      const assignedRoles: PlayerRole[] = [
        { playerId: diviner.id, player: diviner.name, role: 'Adivino' },
        { playerId: confidant.id, player: confidant.name, role: 'Confidente' },
        { playerId: liar.id, player: liar.name, role: 'Mentiroso' },
        ...others.map(p => ({ playerId: p.id, player: p.name, role: 'Espectador' as Role }))
      ];

      setRoles(assignedRoles);
      setTimeLeft(roundTime);
      setGameState('assignment');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const beginPlay = () => setGameState('playing');
  
  const goToVoting = () => setGameState('voting');

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
    
    setGameState('result');
  };

  const nextRound = () => {
    // Check if game is over (only 1 or 2 players left in MUERTE mode)
    const alive = sessionManager.activeSession?.players.filter(p => !p.isEliminated) || [];
    if (sessionManager.activeSession?.scoringMode === 'MUERTE' && alive.length < 3) {
      setGameState('game_over');
    } else {
      startRound();
    }
  };

  const resetGame = () => {
    setGameState('home');
    setCurrentSecret(null);
    setRoles([]);
    setVotedPlayerId(null);
  };

  return {
    gameState,
    gameMode,
    categories,
    roundTime,
    timeLeft,
    currentSecret,
    roles,
    votedPlayerId,
    isLoading,
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
