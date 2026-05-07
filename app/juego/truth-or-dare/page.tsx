'use client';

import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { PlayerLobby } from '../../../components/PlayerLobby';
import { SessionHeader } from '../../../components/SessionHeader';
import { SessionPicker } from '../../../components/SessionPicker';
import TruthOrDareGame from '../../../games/truth-or-dare/TruthOrDareGame';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../../lib/types';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function TruthOrDarePage() {
  const { 
    isOnline, isHost, players, onlineGameState, 
    updatePlayers, updateGameState, activeSession,
    setActiveSessionId, sessions, createSession, deleteSession
  } = useGameState();

  const [phase, setPhase] = useState<'lobby' | 'playing'>('lobby');
  
  // Truth or Dare specific state
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [lastAction, setLastAction] = useState<'VERDAD' | 'RETO' | null>(null);
  const [history, setHistory] = useState<{ player: string, type: 'VERDAD' | 'RETO' }[]>([]);

  // Online Sync
  useEffect(() => {
    if (isOnline && onlineGameState) {
      if (onlineGameState.phase) setPhase(onlineGameState.phase);
      if (onlineGameState.currentPlayerIndex !== undefined) setCurrentPlayerIndex(onlineGameState.currentPlayerIndex);
      if (onlineGameState.lastAction !== undefined) setLastAction(onlineGameState.lastAction);
      if (onlineGameState.history) setHistory(onlineGameState.history);
    }
  }, [isOnline, onlineGameState]);

  const pushState = (updates: any) => {
    if (isOnline && isHost) {
      updateGameState({
        phase,
        currentPlayerIndex,
        lastAction,
        history,
        ...updates
      });
    }
  };

  const handleAction = (type: 'VERDAD' | 'RETO') => {
    if (isOnline && !isHost) return; // Only host handles turns? Actually, for this game, maybe everyone can?
    // User request: "En el modo Online, implementa una lógica donde solo el Host tenga permiso de escritura"
    
    setLastAction(type);
    const newHistory = [{ player: players[currentPlayerIndex % players.length].name, type }, ...history].slice(0, 5);
    setHistory(newHistory);
    
    pushState({ lastAction: type, history: newHistory });

    setTimeout(() => {
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
      setLastAction(null);
      pushState({ 
        currentPlayerIndex: nextIndex, 
        lastAction: null,
        history: newHistory
      });
    }, 1500);
  };

  const handleStartGame = () => {
    setPhase('playing');
    pushState({ phase: 'playing' });
  };

  const handleBackToMenu = () => {
    setPhase('lobby');
    pushState({ phase: 'lobby' });
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0a0b14] min-h-screen text-white">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      <SessionHeader gameTitle="Verdad o Reto" />

      <AnimatePresence mode="wait">
        {!activeSession ? (
          <motion.div 
            key="session_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md z-10"
          >
            <SessionPicker 
              sessions={sessions}
              onSelect={(id) => setActiveSessionId(id)}
              onCreate={(name) => createSession(name)}
              onDelete={deleteSession}
            />
            <Link href="/hub" className="mt-8 flex items-center justify-center gap-2 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              <Home className="w-3 h-3" />
              Volver al Hub
            </Link>
          </motion.div>
        ) : phase === 'lobby' ? (
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
            <TruthOrDareGame 
              players={players.filter(p => !p.isManualSpectator)} 
              currentPlayerIndex={currentPlayerIndex}
              lastAction={lastAction}
              history={history}
              onAction={handleAction}
              onBackToMenu={handleBackToMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
