import { useState, useEffect } from 'react';
import { Player, ScoringMode, Role } from '../lib/types';

const STORAGE_KEY = 'confidente_mentiroso_scores';

export function useScoreManager() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Adivino', score: 0, hp: 5, isEliminated: false },
    { id: '2', name: 'Jugador 2', score: 0, hp: 5, isEliminated: false },
    { id: '3', name: 'Jugador 3', score: 0, hp: 5, isEliminated: false },
  ]);

  const [initialHP, setInitialHP] = useState<number>(5);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load scores", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  const initPlayers = (hp: number) => {
    setInitialHP(hp);
    setPlayers(prev => prev.map(p => ({
      ...p,
      score: 0,
      hp: hp,
      isEliminated: false
    })));
  };

  const updateScores = (
    scoringMode: ScoringMode, 
    votedPlayerId: string, 
    roles: { player: string, role: Role }[]
  ) => {
    setPlayers(prev => {
      const next = [...prev];
      
      const adivinoRole = roles.find(r => r.role === 'Adivino')!;
      const mentirosoRole = roles.find(r => r.role === 'Mentiroso')!;
      const confidenteRole = roles.find(r => r.role === 'Confidente')!;

      // Find players in our state by name (matching roles)
      const diviner = next.find(p => p.name === adivinoRole.player)!;
      const liar = next.find(p => p.name === mentirosoRole.player)!;
      const confidant = next.find(p => p.name === confidenteRole.player)!;

      const votedPlayer = next.find(p => p.id === votedPlayerId)!;
      const isCorrect = votedPlayer.name === liar.name;

      if (scoringMode === 'ORIGINAL') {
        if (!isCorrect) {
          // Mentiroso engañó al adivino
          liar.score += 1; 
        } else {
          // Adivino acertó
          diviner.score += 1;
        }
      } else if (scoringMode === 'MANSALVA') {
        // +1 a quien el adivino elija como "dueño de la verdad"
        votedPlayer.score += 1;
      } else if (scoringMode === 'MUERTE') {
        if (!isCorrect) {
          // Mentiroso engañó -> Adivino y Confidente pierden 1 HP
          diviner.hp -= 1;
          confidant.hp -= 1;
        } else {
          // Adivino acertó -> Mentiroso pierde 1 HP
          liar.hp -= 1;
        }
        
        // Update elimination status
        next.forEach(p => {
          if (p.hp <= 0) {
            p.hp = 0;
            p.isEliminated = true;
          }
        });
      }

      return next;
    });
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const resetScores = () => {
    initPlayers(initialHP);
  };

  return {
    players,
    initialHP,
    setInitialHP,
    initPlayers,
    updateScores,
    updatePlayerName,
    resetScores
  };
}
