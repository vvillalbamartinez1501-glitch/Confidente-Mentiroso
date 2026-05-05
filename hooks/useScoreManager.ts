'use client';

import { Player, ScoringMode } from '../lib/types';

export function useScoreManager(
  players: Player[], 
  onPlayersChange: (players: Player[]) => void,
  initialHP: number
) {

  const updatePlayerName = (id: string, name: string) => {
    const newPlayers = players.map(p => p.id === id ? { ...p, name } : p);
    onPlayersChange(newPlayers);
  };

  const adjustScore = (id: string, delta: number) => {
    const newPlayers = players.map(p => p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p);
    onPlayersChange(newPlayers);
  };

  const adjustHP = (id: string, delta: number) => {
    const newPlayers = players.map(p => {
      if (p.id !== id) return p;
      const newHP = Math.max(0, Math.min(10, p.hp + delta));
      return { ...p, hp: newHP, isEliminated: newHP === 0 };
    });
    onPlayersChange(newPlayers);
  };

  const updateScoresAfterRound = (liarId: string, divinerChoiceId: string, mode: ScoringMode) => {
    const next = players.map(p => ({ ...p }));
    const diviner = next.find(p => p.id === '1' || p.role === 'Adivino'); 
    // Note: ID '1' was used previously for Adivino. With session rotation, we need a better way.
    // I'll assume for now that ID '1' is the Adivino for the UI logic, but I'll fix this in useGameLogic.
    
    // Actually, I'll pass the Adivino ID too.
  };

  // I'll make updateScores more explicit by passing IDs
  const applyRoundResults = (divinerId: string, liarId: string, chosenId: string, mode: ScoringMode) => {
    const next = players.map(p => ({ ...p }));
    const diviner = next.find(p => p.id === divinerId)!;
    const chosen = next.find(p => p.id === chosenId)!;
    const liar = next.find(p => p.id === liarId)!;

    const isCorrect = liarId === chosenId;

    if (mode === 'ORIGINAL') {
      if (!isCorrect) {
        liar.score += 1; 
      } else {
        diviner.score += 1;
      }
    } else if (mode === 'MANSALVA') {
      chosen.score += 1;
    } else if (mode === 'MUERTE') {
      if (!isCorrect) {
        diviner.hp -= 1;
        // Find a confidant (anyone who isn't diviner or liar)
        const confidant = next.find(p => p.id !== divinerId && p.id !== liarId && !p.isEliminated);
        if (confidant) confidant.hp -= 1;
      } else {
        liar.hp -= 1;
      }
      
      next.forEach(p => {
        if (p.hp <= 0) {
          p.hp = 0;
          p.isEliminated = true;
        }
      });
    }
    onPlayersChange(next);
  };

  const resetPlayersStats = (hp: number) => {
    const newPlayers = players.map(p => ({ ...p, score: 0, hp, isEliminated: false }));
    onPlayersChange(newPlayers);
  };

  return {
    updatePlayerName,
    adjustScore,
    adjustHP,
    applyRoundResults,
    resetPlayersStats
  };
}
