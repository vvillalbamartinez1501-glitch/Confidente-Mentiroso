import { useState, useEffect, useCallback } from 'react';
import { Category as ImageCategory } from '../lib/imageLoader';
import { GameMode, GameState, PlayerRole, GameSecret, ScoringMode } from '../lib/types';
import { ContentManager } from '../lib/contentManager';
import { useScoreManager } from './useScoreManager';

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [gameMode, setGameMode] = useState<GameMode>('IMAGES');
  const [scoringMode, setScoringMode] = useState<ScoringMode>('ORIGINAL');
  const [categories, setCategories] = useState<string[]>([]);
  const [roundTime, setRoundTime] = useState<number>(60); // seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [roles, setRoles] = useState<PlayerRole[]>([]);
  const [currentSecret, setCurrentSecret] = useState<GameSecret | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const scoreManager = useScoreManager();

  const startGameSetup = () => setGameState('mode_select');

  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('scoring_select');
  };

  const selectScoring = (mode: ScoringMode) => {
    setScoringMode(mode);
    setCategories([]);
    setGameState('setup');
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const startRound = async () => {
    setIsLoading(true);
    
    // Assign roles randomly
    const isPlayer2Truth = Math.random() > 0.5;
    setRoles([
      { player: 'Jugador 2', role: isPlayer2Truth ? 'Confidente' : 'Mentiroso' },
      { player: 'Jugador 3', role: isPlayer2Truth ? 'Mentiroso' : 'Confidente' },
    ]);

    // Load Secret
    try {
      const activeCategories = categories.length > 0 ? categories : (gameMode === 'WORDS' ? ['OBJETOS'] : ['objects']);
      const secret = await ContentManager.getRandomSecret(gameMode, activeCategories);
      setCurrentSecret(secret);
    } catch (error) {
      console.error("Error loading secret:", error);
    }
    
    setIsLoading(false);
    setGameState('assignment');
  };

  const beginPlay = () => {
    setGameState('playing');
    setTimeLeft(roundTime);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0 && roundTime !== Infinity) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0 && roundTime !== Infinity) {
      setGameState('voting');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, roundTime]);

  const goToVoting = () => setGameState('voting');

  const submitVote = (playerId: string) => {
    scoreManager.updateScores(scoringMode, playerId, roles);
    
    // Check if game over (only for MUERTE mode)
    if (scoringMode === 'MUERTE' && scoreManager.players.some(p => p.hp <= 0)) {
       // Note: we check after update, but update is async state. 
       // In a real app we might want to check the next state.
       // For now, we'll go to result and check there.
    }
    setGameState('result');
  };

  const nextRound = () => {
    if (scoringMode === 'MUERTE' && scoreManager.players.some(p => p.hp <= 0)) {
      setGameState('game_over');
    } else {
      startRound();
    }
  };

  const resetGame = () => {
    scoreManager.resetScores();
    setGameState('home');
  };

  return {
    gameState,
    gameMode,
    scoringMode,
    categories,
    roundTime,
    timeLeft,
    roles,
    currentSecret,
    isLoading,
    scoreManager,
    startGameSetup,
    selectMode,
    selectScoring,
    toggleCategory,
    setRoundTime,
    startRound,
    beginPlay,
    goToVoting,
    revealResult: goToVoting,
    submitVote,
    nextRound,
    resetGame
  };
}
