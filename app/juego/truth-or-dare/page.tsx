'use client';

import React, { useState } from 'react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { PlayerLobby } from '../../../components/PlayerLobby';
import { SessionHeader } from '../../../components/SessionHeader';
import { SessionPicker } from '../../../components/SessionPicker';
import TruthOrDareGame from '../../../games/truth-or-dare/TruthOrDareGame';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../../lib/types';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function TruthOrDarePage() {
  const sessionManager = useGlobalContext();
  const [phase, setPhase] = useState<'lobby' | 'playing'>('lobby');

  const players = sessionManager.activeSession?.players || [];

  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      score: 0,
      hp: 5,
      isEliminated: false,
      isManualSpectator: false
    };
    sessionManager.updateActiveSessionPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    sessionManager.updateActiveSessionPlayers(players.filter(p => p.id !== id));
  };

  const handleUpdatePlayer = (id: string, name: string) => {
    sessionManager.updateActiveSessionPlayers(
      players.map(p => p.id === id ? { ...p, name } : p)
    );
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const newPlayers = [...players];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newPlayers.length) return;
    
    const [movedPlayer] = newPlayers.splice(index, 1);
    newPlayers.splice(newIndex, 0, movedPlayer);
    sessionManager.updateActiveSessionPlayers(newPlayers);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0a0b14] min-h-screen text-white">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

      <SessionHeader gameTitle="Verdad o Reto" />

      <AnimatePresence mode="wait">
        {!sessionManager.activeSession ? (
          <motion.div 
            key="session_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md z-10"
          >
            <SessionPicker 
              sessions={sessionManager.sessions}
              onSelect={(id) => sessionManager.setActiveSessionId(id)}
              onCreate={(name) => sessionManager.createSession(name)}
              onDelete={sessionManager.deleteSession}
            />
            <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
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
              onAdd={handleAddPlayer}
              onRemove={handleRemovePlayer}
              onUpdate={handleUpdatePlayer}
              onReorder={handleReorder}
              onContinue={() => setPhase('playing')}
              onToggleSpectator={(id) => {
                sessionManager.updateActiveSessionPlayers(
                  players.map(p => p.id === id ? { ...p, isManualSpectator: !p.isManualSpectator } : p)
                );
              }}
            />
            <button 
              onClick={() => sessionManager.setActiveSessionId(null)}
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
              onBackToMenu={() => setPhase('lobby')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
