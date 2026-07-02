'use client';

import React, { useState, useEffect } from 'react';
import { useGameState } from '../../../hooks/useGameState';
import { PlayerLobby } from '../../../components/PlayerLobby';
import { OnlinePlayerLobby } from '../../../components/OnlinePlayerLobby';
import { SessionHeader } from '../../../components/SessionHeader';
import { SessionPicker } from '../../../components/SessionPicker';
import TriviaCaoticaGame from '../../../games/trivia-caotica/TriviaCaoticaGame';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function TriviaCaoticaPage() {
  const { 
    isOnline, isHost, players, onlineGameState, 
    updatePlayers, updateGameState, activeSession,
    setActiveSessionId, sessions, createSession, deleteSession,
    playerId, updateScoring, kickPlayer, leaveRoom
  } = useGameState();

  const [phase, setPhase] = useState<'lobby' | 'playing'>('lobby');
  const [playWithoutSession, setPlayWithoutSession] = useState(false);

  // Sync phase with Supabase in Online mode
  useEffect(() => {
    if (isOnline && onlineGameState) {
      if (onlineGameState.pagePhase) {
        setPhase(onlineGameState.pagePhase);
      }
    }
  }, [isOnline, onlineGameState]);

  const handleStartGame = () => {
    setPhase('playing');
    if (isOnline && isHost) {
      updateGameState({
        pagePhase: 'playing',
        phase: 'CATEGORY_SELECT' // Reset trivia phase
      });
    }
  };

  const handleBackToMenu = () => {
    if (playWithoutSession) {
      setPlayWithoutSession(false);
    } else {
      setPhase('lobby');
      if (isOnline && isHost) {
        updateGameState({
          pagePhase: 'lobby'
        });
      }
    }
  };

  const handleUpdateGameState = (updates: any) => {
    if (isOnline && isHost) {
      updateGameState({
        ...onlineGameState,
        ...updates
      });
    }
  };

  const gamePlayers = players.filter(p => !p.isManualSpectator);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#07080d] min-h-screen text-white">
      
      {/* Background Decor Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

      <SessionHeader 
        gameTitle="Trivia Caótica" 
        gameColor="text-emerald-400" 
        phase={playWithoutSession ? 'playing' : phase} 
      />

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
              className="w-full py-4 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 hover:from-emerald-500/30 hover:to-teal-600/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-teal-500/5"
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
            {isOnline ? (
              <OnlinePlayerLobby 
                roomCode={activeSession?.roomCode || ''}
                players={players}
                isHost={isHost}
                onKick={kickPlayer}
                onLeave={async () => {
                  await leaveRoom();
                  setActiveSessionId(null);
                }}
                onStart={handleStartGame}
                minPlayers={1}
              />
            ) : (
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
                minPlayers={1}
              />
            )}
            {!isOnline && (
              <button 
                onClick={() => setActiveSessionId(null)}
                className="mt-6 w-full text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
              >
                Cambiar Sesión
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full flex-1 flex justify-center items-center z-10"
          >
            <TriviaCaoticaGame
              isOnline={isOnline}
              isHost={playWithoutSession ? true : isHost}
              players={players}
              playerId={playerId}
              gameState={onlineGameState}
              onUpdateGameState={handleUpdateGameState}
              onUpdatePlayers={updatePlayers}
              onBackToMenu={handleBackToMenu}
              scoringMode={activeSession?.scoringMode || 'ORIGINAL'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
