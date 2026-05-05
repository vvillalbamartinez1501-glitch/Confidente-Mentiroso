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
      
      // Map roles to player IDs (assuming 'Jugador 2' is ID '2' and 'Jugador 3' is ID '3')
      const player2Role = roles.find(r => r.player === 'Jugador 2')?.role;
      const player3Role = roles.find(r => r.player === 'Jugador 3')?.role;
      
      const diviner = next.find(p => p.id === '1')!;
      const p2 = next.find(p => p.id === '2')!;
      const p3 = next.find(p => p.id === '3')!;

      const votedPlayer = next.find(p => p.id === votedPlayerId)!;
      const isCorrect = (votedPlayerId === '2' && player2Role === 'Mentiroso') || 
                        (votedPlayerId === '3' && player3Role === 'Mentiroso');

      if (scoringMode === 'ORIGINAL') {
        if (!isCorrect) {
          // Mentiroso engañó al adivino
          votedPlayer.score += 1; 
        } else {
          // Adivino acertó
          diviner.score += 1;
        }
      } else if (scoringMode === 'MANSALVA') {
        // +1 a quien el adivino elija como "dueño de la verdad"
        votedPlayer.score += 1;
      } else if (scoringMode === 'MUERTE') {
        if (!isCorrect) {
          // Mentiroso engañó -> Adivino y el otro jugador (el Confidente) pierden 1 HP
          diviner.hp -= 1;
          const confidantId = votedPlayerId === '2' ? '3' : '2';
          const confidant = next.find(p => p.id === confidantId)!;
          confidant.hp -= 1;
        } else {
          // Adivino acertó -> Mentiroso pierde 1 HP
          votedPlayer.hp -= 1;
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

  const resetScores = () => {
    initPlayers(initialHP);
  };

  return {
    players,
    initialHP,
    setInitialHP,
    initPlayers,
    updateScores,
    resetScores
  };
}
