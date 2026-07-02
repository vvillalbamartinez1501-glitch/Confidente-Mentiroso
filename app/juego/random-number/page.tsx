'use client';

import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { PlayerLobby } from '../../../components/PlayerLobby';
import { SessionHeader } from '../../../components/SessionHeader';
import { SessionPicker } from '../../../components/SessionPicker';
import RandomNumberGame from '../../../games/random-number/RandomNumberGame';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function RandomNumberPage() {
  const { 
    isOnline, isHost, players, onlineGameState, 
    updatePlayers, updateGameState, activeSession,
    setActiveSessionId, sessions, createSession, deleteSession
  } = useGameState();

  const [phase, setPhase] = useState<'lobby' | 'playing'>('lobby');
  const [playWithoutSession, setPlayWithoutSession] = useState(false);

  // Random Number specific state
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(10);
  const [count, setCount] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [rollId, setRollId] = useState('');

  // Online Sync
  useEffect(() => {
    if (isOnline && onlineGameState) {
      if (onlineGameState.phase) setPhase(onlineGameState.phase);
      if (onlineGameState.min !== undefined) setMin(onlineGameState.min);
      if (onlineGameState.max !== undefined) setMax(onlineGameState.max);
      if (onlineGameState.count !== undefined) setCount(onlineGameState.count);
      if (onlineGameState.numbers !== undefined) setNumbers(onlineGameState.numbers);
      if (onlineGameState.rollId !== undefined) setRollId(onlineGameState.rollId);
    }
  }, [isOnline, onlineGameState]);

  const pushState = (updates: any) => {
    if (isOnline && isHost) {
      updateGameState({
        phase,
        min,
        max,
        count,
        numbers,
        rollId,
        ...updates
      });
    }
  };

  const handleUpdateSettings = (newMin: number, newMax: number, newCount: number) => {
    setMin(newMin);
    setMax(newMax);
    setCount(newCount);
    pushState({ min: newMin, max: newMax, count: newCount });
  };

  const handleGenerate = (newNumbers: number[]) => {
    const newRollId = crypto.randomUUID();
    setNumbers(newNumbers);
    setRollId(newRollId);
    pushState({ numbers: newNumbers, rollId: newRollId });
  };

  const handleStartGame = () => {
    setPhase('playing');
    pushState({ phase: 'playing' });
  };

  const handleBackToMenu = () => {
    if (playWithoutSession) {
      setPlayWithoutSession(false);
    } else {
      setPhase('lobby');
      pushState({ phase: 'lobby' });
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0a0b14] min-h-screen text-white">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      <SessionHeader gameTitle="Números Aleatorios" gameColor="text-amber-400" phase={playWithoutSession ? 'playing' : phase} />

      <AnimatePresence mode="wait">
        {!activeSession && !playWithoutSession ? (
          <motion.div 
            key="session_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md z-10 flex flex-col gap-4"
          >
            <SessionPicker 
              sessions={sessions}
              onSelect={(id) => setActiveSessionId(id)}
              onCreate={(name) => createSession(name)}
              onDelete={deleteSession}
            />
            
            <button 
              onClick={() => setPlayWithoutSession(true)}
              className="w-full py-4 bg-gradient-to-r from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 border border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-orange-500/5"
            >
              Jugar sin Sesión (Rápido)
            </button>

            <Link href="/hub" className="mt-4 flex items-center justify-center gap-2 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              <Home className="w-3 h-3" />
              Volver al Hub
            </Link>
          </motion.div>
        ) : (phase === 'lobby' && !playWithoutSession) ? (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md z-10"
          >
            <PlayerLobby 
              players={players}
              onAdd={(name) => updatePlayers([...players, { id: crypto.randomUUID(), name, score: 0, hp: 5, isEliminated: false, isManualSpectator: false }])}
              onRemove={(id) => updatePlayers(players.filter(p => p.id !== id))}
              onUpdate={(id, name) => updatePlayers(players.map(p => p.id === id ? { ...p, name } : p))}
              onReorder={(index, direction) => {
                const newPlayers = [...players];
                const newIndex = direction === 'up' ? index - 1 : index + 1;
                if (newIndex < 0 || newIndex >= newPlayers.length) return;
                const [movedPlayer] = newPlayers.splice(index, 1);
                newPlayers.splice(newIndex, 0, movedPlayer);
                updatePlayers(newPlayers);
              }}
              onContinue={handleStartGame}
              onToggleSpectator={(id) => {
                updatePlayers(players.map(p => p.id === id ? { ...p, isManualSpectator: !p.isManualSpectator } : p));
              }}
            />
            <button 
              onClick={() => setActiveSessionId(null)}
              className="mt-6 w-full text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
            >
              Cambiar Sesión
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full flex justify-center z-10"
          >
            <RandomNumberGame
              isOnline={isOnline}
              isHost={playWithoutSession ? true : isHost}
              gameState={{ min, max, count, numbers, rollId }}
              onGenerate={handleGenerate}
              onUpdateSettings={handleUpdateSettings}
              onBackToMenu={handleBackToMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
