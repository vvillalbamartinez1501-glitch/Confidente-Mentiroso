import { useState, useEffect, useCallback } from 'react';
import { Category, GameImage, ImageEngine } from '../lib/imageLoader';

export type GameState = 'home' | 'setup' | 'assignment' | 'playing' | 'result';
export type Role = 'Confidente' | 'Mentiroso';

interface PlayerRole {
  player: string;
  role: Role;
}

export function useGameLogic() {
  const [gameState, setGameState] = useState<GameState>('home');
  const [categories, setCategories] = useState<Category[]>(['flags', 'memes', 'movies', 'objects', 'geek']);
  const [roundTime, setRoundTime] = useState<number>(60); // seconds
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [roles, setRoles] = useState<PlayerRole[]>([]);
  const [currentImage, setCurrentImage] = useState<GameImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startGameSetup = () => setGameState('setup');

  const toggleCategory = (cat: Category) => {
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

    // Load Image
    const activeCategories = categories.length > 0 ? categories : ['objects'];
    const img = await ImageEngine.getRandomImage(activeCategories as Category[]);
    setCurrentImage(img);
    
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
      setGameState('result');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, roundTime]);

  const revealResult = () => setGameState('result');

  const nextRound = () => startRound();

  const resetGame = () => setGameState('home');

  return {
    gameState,
    categories,
    roundTime,
    timeLeft,
    roles,
    currentImage,
    isLoading,
    startGameSetup,
    toggleCategory,
    setRoundTime,
    startRound,
    beginPlay,
    revealResult,
    nextRound,
    resetGame
  };
}
