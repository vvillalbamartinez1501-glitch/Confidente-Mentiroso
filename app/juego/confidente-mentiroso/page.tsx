'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Settings, Info, Clock, Check, X, RotateCcw, 
  EyeOff, ShieldCheck, AlertTriangle, Image as ImageIcon, 
  Type, LayoutGrid, Trophy, Heart, Skull, Zap, Target, Swords, UserCheck, Users, Plus, Home as HomeIcon, Loader2
} from 'lucide-react';
import { useGameLogic } from '../../../hooks/useGameLogic';
import { GameCard } from '../../../components/GameCard';
import { WORD_CATEGORIES } from '../../../constants/words';
import { Scoreboard } from '../../../components/Scoreboard';
import { ScoringMode, Player } from '../../../lib/types';
import { InstructionsModal } from '../../../components/InstructionsModal';
import { SessionPicker } from '../../../components/SessionPicker';
import { PlayerLobby } from '../../../components/PlayerLobby';
import { OnlinePlayerLobby } from '../../../components/OnlinePlayerLobby';
import { useGlobalContext } from '../../../context/GlobalContext';
import { SessionHeader } from '../../../components/SessionHeader';
import { DRIVE_CATEGORIES } from '../../../lib/imageLoader';
import { Cloud } from 'lucide-react';
import Link from 'next/link';

const IMAGE_CATEGORY_ICONS: Record<string, string> = {
  flags: '🌍',
  memes: '😂',
  movies: '🎬',
  objects: '📦',
  geek: '👾'
};

const SCORING_DESCRIPTIONS: Record<ScoringMode, { title: string, desc: string, icon: any, color: string }> = {
  ORIGINAL: {
    title: 'Modo Original',
    desc: 'Sistema clásico. Puntos por engañar o descubrir.',
    icon: Target,
    color: 'text-blue-400'
  },
  MANSALVA: {
    title: 'Puntos a Mansalva',
    desc: 'Modo caótico. El que sea elegido suma siempre.',
    icon: Zap,
    color: 'text-yellow-400'
  },
  MUERTE: {
    title: 'Muerte por Puntos',
    desc: 'Los jugadores tienen HP. El último en pie gana.',
    icon: Swords,
    color: 'text-rose-500'
  }
};

export default function ConfidenteMentirosoPage() {
  const sessionManager = useGlobalContext();
  const game = useGameLogic(sessionManager);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Reset showRoles when moving to assignment state (now handled via game.toggleShowRoles)
  React.useEffect(() => {
    if (game.gameState === 'assignment' && game.isHost) {
      game.toggleShowRoles(false);
    }
  }, [game.gameState, game.isHost]);

  // Helper to handle player additions/removals in lobby
  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      score: 0,
      hp: 5,
      isEliminated: false,
      isManualSpectator: false
    };
    sessionManager.updateActiveSessionPlayers([...(sessionManager.activeSession?.players || []), newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    sessionManager.updateActiveSessionPlayers(
      (sessionManager.activeSession?.players || []).filter(p => p.id !== id)
    );
  };

  const handleUpdatePlayer = (id: string, name: string) => {
    sessionManager.updateActiveSessionPlayers(
      (sessionManager.activeSession?.players || []).map(p => p.id === id ? { ...p, name } : p)
    );
  };

  const handleToggleSpectator = (id: string) => {
    sessionManager.updateActiveSessionPlayers(
      (sessionManager.activeSession?.players || []).map(p => 
        p.id === id ? { ...p, isManualSpectator: !p.isManualSpectator } : p
      )
    );
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const players = [...(sessionManager.activeSession?.players || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= players.length) return;
    
    const [movedPlayer] = players.splice(index, 1);
    players.splice(newIndex, 0, movedPlayer);
    sessionManager.updateActiveSessionPlayers(players);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0f111a] to-black min-h-screen">
      
      <SessionHeader gameTitle="Confidente y Mentiroso" />

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 sm:w-96 h-64 sm:h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <InstructionsModal 
        isOpen={isInstructionsOpen} 
        onClose={() => setIsInstructionsOpen(false)} 
      />

      <AnimatePresence mode="wait">
        
        {/* HOME STATE */}
        {game.gameState === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center max-w-md w-full gap-6 sm:gap-8 z-10"
          >
            <div className="text-center">
              <motion.h1 
                initial={{ letterSpacing: '0.1em' }}
                animate={{ letterSpacing: '0.01em' }}
                className="text-4xl sm:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 drop-shadow-2xl"
              >
                CONFIDENTE
              </motion.h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 italic tracking-widest">
                Y MENTIROSO
              </h2>
            </div>
            
            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={game.startGameSetup}
                className="group relative flex items-center justify-center gap-3 w-full py-5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="w-6 h-6 fill-blue-400 text-blue-400" />
                <span className="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase">Nueva Partida</span>
              </button>

              <button 
                onClick={() => setIsInstructionsOpen(true)}
                className="flex items-center justify-center gap-3 w-full py-4 bg-transparent border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400"
              >
                <Info className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Cómo Jugar</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* SESSION SELECT STATE */}
        {game.gameState === 'session_select' && (
          <motion.div 
            key="session_select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md z-10 px-2 sm:px-0"
          >
            <SessionPicker 
              sessions={sessionManager.sessions}
              onSelect={(id) => {
                sessionManager.setActiveSessionId(id);
                game.goToGroupManage();
              }}
              onCreate={(name) => {
                sessionManager.createSession(name);
                game.goToGroupManage();
              }}
              onDelete={sessionManager.deleteSession}
            />
            <button onClick={game.resetGame} className="mt-6 w-full text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              Volver al inicio
            </button>
          </motion.div>
        )}

        {/* GROUP MANAGE STATE */}
        {game.gameState === 'group_manage' && (
          <motion.div 
            key="group_manage"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md z-10 px-2 sm:px-0"
          >
            {game.isOnline ? (
              <OnlinePlayerLobby 
                roomCode={sessionManager.activeSession?.roomCode || ''}
                players={sessionManager.onlinePlayers}
                isHost={game.isHost}
                onKick={sessionManager.kickPlayer}
                onLeave={() => {
                  sessionManager.leaveRoom();
                  game.resetGame();
                }}
                onStart={() => game.setGameState('scoring_select')}
              />
            ) : (
              <>
                <PlayerLobby 
                  players={sessionManager.activeSession?.players || []}
                  onAdd={handleAddPlayer}
                  onRemove={handleRemovePlayer}
                  onUpdate={handleUpdatePlayer}
                  onToggleSpectator={handleToggleSpectator}
                  onReorder={handleReorder}
                  onContinue={() => game.setGameState('scoring_select')}
                />
                <button onClick={() => game.setGameState('session_select')} className="mt-6 w-full text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  Cambiar Sesión
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* SCORING SELECT STATE */}
        {game.gameState === 'scoring_select' && (
          <motion.div 
            key="scoring_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center max-w-md w-full gap-6 sm:gap-8 z-10 px-2 sm:px-0"
          >
            {game.isOnline && !game.isHost ? (
               <div className="flex flex-col items-center gap-6 py-12">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                 <p className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] text-center">El Host está eligiendo las reglas...</p>
               </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Reglas</h2>
                  <p className="text-gray-400 font-medium italic text-sm">¿Cómo quieres ganar?</p>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full">
                  {(Object.entries(SCORING_DESCRIPTIONS) as [ScoringMode, any][]).map(([mode, data]) => {
                    const Icon = data.icon;
                    return (
                      <button 
                        key={mode}
                        onClick={() => game.selectScoring(mode)}
                        className={`group p-3 sm:p-4 bg-white/5 border rounded-2xl transition-all hover:bg-white/10 flex items-center gap-4 sm:gap-5 ${
                          game.scoringMode === mode ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'
                        }`}
                      >
                        <div className={`p-2 sm:p-3 rounded-xl bg-white/5 ${data.color}`}>
                          <Icon className="w-6 h-6 sm:w-8 h-8" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">{data.title}</h3>
                          <p className="text-gray-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">{data.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button onClick={game.goToGroupManage} className="text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  Volver a Jugadores
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* MODE SELECT STATE */}
        {game.gameState === 'mode_select' && (
          <motion.div 
            key="mode_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center max-w-md w-full gap-6 sm:gap-8 z-10 px-2 sm:px-0"
          >
            {game.isOnline && !game.isHost ? (
               <div className="flex flex-col items-center gap-6 py-12">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                 <p className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] text-center">El Host está eligiendo el modo...</p>
               </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">¿Qué adivinar?</h2>
                  <p className="text-gray-400 font-medium text-sm">Elige el contenido</p>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full">
                  <button 
                    onClick={() => game.selectMode('WORDS')}
                    className="group p-5 sm:p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-2xl transition-all hover:scale-[1.02] hover:border-indigo-400 flex items-center gap-5 sm:gap-6"
                  >
                    <div className="p-3 sm:p-4 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                      <Type className="w-8 h-8 sm:w-10 h-10 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tighter">Palabras</h3>
                      <p className="text-indigo-300/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Conceptos y objetos</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => game.selectMode('IMAGES')}
                    className="group p-5 sm:p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/30 rounded-2xl transition-all hover:scale-[1.02] hover:border-blue-400 flex items-center gap-5 sm:gap-6"
                  >
                    <div className="p-3 sm:p-4 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <ImageIcon className="w-8 h-8 sm:w-10 h-10 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tighter">Fotos</h3>
                      <p className="text-blue-300/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Imágenes aleatorias</p>
                    </div>
                  </button>
                </div>

                <button onClick={() => game.setGameState('scoring_select')} className="text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  Volver a Reglas
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* SETUP STATE */}
        {game.gameState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col w-full max-w-md gap-6 z-10 px-2 sm:px-0"
          >
            {game.isOnline && !game.isHost ? (
               <div className="flex flex-col items-center gap-6 py-12">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                 <p className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] text-center">El Host está configurando la partida...</p>
               </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
                    <Settings className="w-6 h-6 sm:w-8 h-8 text-blue-400" />
                    Ajustes
                  </h2>
                </div>

                <div className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col gap-6 bg-white/5 border-white/10 overflow-y-auto max-h-[60vh] sm:max-h-[70vh] no-scrollbar">
                  
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Categorías
                    </h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {game.gameMode === 'WORDS' ? (
                        Object.entries(WORD_CATEGORIES).map(([key, cat]) => {
                          const isSelected = game.categories.includes(key);
                          return (
                            <button
                              key={key}
                              onClick={() => game.toggleCategory(key)}
                              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs sm:text-sm ${
                                isSelected 
                                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100' 
                                  : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                              }`}
                            >
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {Object.entries(IMAGE_CATEGORY_ICONS).map(([cat, icon]) => {
                            const isSelected = game.categories.includes(cat);
                            return (
                              <button
                                key={cat}
                                onClick={() => game.toggleCategory(cat)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs sm:text-sm ${
                                  isSelected 
                                    ? 'bg-blue-500/20 border-blue-400 text-blue-100' 
                                    : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                                }`}
                              >
                                <span>{icon}</span>
                                <span className="capitalize">{cat === 'flags' ? 'Banderas' : cat}</span>
                              </button>
                            );
                          })}
                          
                          {/* Picsum Provider Button */}
                          <button
                            onClick={() => game.toggleCategory('PICSUM_RANDOM')}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs sm:text-sm ${
                              game.categories.includes('PICSUM_RANDOM') 
                                ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
                                : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                          >
                            <Zap className={`w-4 h-4 ${game.categories.includes('PICSUM_RANDOM') ? 'text-yellow-400' : 'text-gray-500'}`} />
                            <span>Fotos Aleatorias</span>
                          </button>

                          {/* Drive Categories */}
                          {DRIVE_CATEGORIES.map(cat => {
                            const isSelected = game.categories.includes(cat);
                            return (
                              <button
                                key={cat}
                                onClick={() => game.toggleCategory(cat)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border-2 transition-all font-bold text-xs sm:text-sm ${
                                  isSelected 
                                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.2)]' 
                                    : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                                }`}
                              >
                                <Cloud className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`} />
                                <span className="capitalize">{cat}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Tiempo
                    </h3>
                    <div className="flex gap-2">
                      {[30, 60, 120, Infinity].map(t => (
                        <button
                          key={t}
                          onClick={() => game.setRoundTime(t)}
                          className={`flex-1 py-2 sm:py-3 rounded-xl border-2 transition-all font-mono font-bold text-sm ${
                            game.roundTime === t
                              ? 'bg-purple-500/20 border-purple-400 text-purple-100'
                              : 'bg-transparent border-white/5 text-gray-500'
                          }`}
                        >
                          {t === Infinity ? '∞' : `${t}s`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => game.setGameState('mode_select')} 
                    className="py-4 px-5 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
                  >
                    Volver
                  </button>
                  <button 
                    onClick={game.startRound}
                    disabled={game.categories.length === 0 || game.isLoading}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-base sm:text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex justify-center uppercase tracking-widest text-white"
                  >
                    {game.isLoading ? '...' : '¡A Jugar!'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ASSIGNMENT STATE */}
        {game.gameState === 'assignment' && (
          <motion.div 
            key="assignment"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center text-center w-full max-w-md gap-6 z-10 px-2 sm:px-0"
          >
            <AnimatePresence mode="wait">
              {!game.showRoles ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex flex-col gap-6"
                >
                  <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 p-6 rounded-3xl flex flex-col items-center gap-4 w-full">
                    <div className="p-4 bg-blue-500/20 rounded-full animate-pulse">
                      <UserCheck className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Identificación del Adivino</h2>
                      <p className="font-bold text-sm uppercase tracking-tight opacity-80">
                        {game.roles.find(r => r.role === 'Adivino')?.player}, tú eres el Adivino.
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl bg-white/5 border-white/10">
                    {game.isOnline ? (
                      <p className="text-gray-300 font-medium leading-relaxed italic">
                        {game.isHost 
                          ? "Espera a que todos estén listos para ver los roles." 
                          : "El Host mostrará los roles en breve..."}
                      </p>
                    ) : (
                      <p className="text-gray-300 font-medium leading-relaxed italic">
                        "Entrega el dispositivo a tus compañeros. <br/> Ellos verán el secreto mientras tú esperas."
                      </p>
                    )}
                  </div>

                  {(!game.isOnline || game.isHost) && (
                    <button 
                      onClick={() => game.toggleShowRoles(true)}
                      className="group relative w-full py-6 bg-blue-600 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] uppercase tracking-widest text-white overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      Mostrar Roles
                    </button>
                  )}
                  {game.isOnline && !game.isHost && (
                    <div className="py-6 text-blue-400/60 font-black uppercase tracking-widest animate-pulse">
                      Esperando al Host...
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex flex-col gap-6"
                >
                  <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 w-full">
                    <div className="p-2 bg-orange-500/20 rounded-full animate-bounce shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="font-black text-left text-[11px] sm:text-xs uppercase tracking-tight">¡Memorizad vuestros roles!</p>
                  </div>

                  <div className="glass-panel p-5 sm:p-6 rounded-3xl w-full flex flex-col gap-4 bg-white/5 border-white/10">
                    {/* Role Display for Online (Highlight current player's role) */}
                    {game.isOnline ? (
                      <div className="flex flex-col gap-4">
                        <div className="p-6 bg-white/10 rounded-2xl border-2 border-white/20 text-center">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tu Rol es:</p>
                          <h4 className={`text-4xl font-black uppercase tracking-tighter ${
                            game.roles.find(r => r.playerId === sessionManager.playerId)?.role === 'Confidente' ? 'text-emerald-400' :
                            game.roles.find(r => r.playerId === sessionManager.playerId)?.role === 'Mentiroso' ? 'text-rose-400' :
                            game.roles.find(r => r.playerId === sessionManager.playerId)?.role === 'Adivino' ? 'text-blue-400' : 'text-gray-400'
                          }`}>
                            {game.roles.find(r => r.playerId === sessionManager.playerId)?.role || 'Espectador'}
                          </h4>
                          {game.roles.find(r => r.playerId === sessionManager.playerId)?.role !== 'Adivino' && (
                             <p className="mt-4 text-xs font-bold text-gray-400">
                               El Secreto es: <span className="text-white uppercase tracking-widest">
                                 {game.currentSecret?.type === 'text' ? game.currentSecret.content : game.currentSecret?.content?.title}
                               </span>
                             </p>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Información de la sala:</p>
                        <div className="grid grid-cols-2 gap-2">
                           {game.roles.filter(r => !r.isManualSpectator).map((r, i) => (
                             <div key={i} className="p-2 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                               <span className="text-[10px] font-bold text-gray-400 truncate mr-1">{r.player}</span>
                               <div className={`w-2 h-2 rounded-full ${
                                 r.role === 'Espectador' ? 'bg-gray-700' : 'bg-emerald-500'
                               }`} />
                             </div>
                           ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {game.roles.filter(r => r.role !== 'Adivino' && !r.isManualSpectator).map((r, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i} 
                            className={`flex justify-between items-center p-4 rounded-2xl border ${
                            r.role === 'Espectador' ? 'bg-black/20 border-white/5 opacity-50' : 'bg-black/40 border-white/10'
                          }`}>
                            <span className="font-black text-white text-base sm:text-lg tracking-tight uppercase truncate mr-2">{r.player}</span>
                            <span className={`font-black text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 rounded-full tracking-widest uppercase shrink-0 ${
                              r.role === 'Confidente' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 
                              r.role === 'Mentiroso' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30' :
                              'text-gray-500 bg-white/5 border border-white/5'
                            }`}>
                              {r.role}
                            </span>
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>

                  {(!game.isOnline || game.isHost) && (
                    <button 
                      onClick={game.beginPlay}
                      className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg shadow-2xl uppercase tracking-widest hover:scale-[1.02] transition-transform"
                    >
                      ¡Empezar Ronda!
                    </button>
                  )}
                  {game.isOnline && !game.isHost && (
                    <div className="py-5 text-gray-500 font-bold uppercase tracking-widest animate-pulse text-center text-sm">
                      Esperando a que el Host empiece...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {game.gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-4 sm:gap-6 z-10 px-2 sm:px-0"
          >
            <div className="w-full flex justify-between items-center px-1">
              <div className="px-4 py-1.5 bg-gray-800/80 backdrop-blur-xl rounded-full font-mono text-xl sm:text-2xl font-bold border border-white/10 flex items-center gap-2 sm:gap-3 text-white">
                <Clock className="w-5 h-5 sm:w-6 h-6 text-indigo-400" />
                {game.roundTime === Infinity ? '∞' : `00:${game.timeLeft.toString().padStart(2, '0')}`}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-indigo-400 font-black tracking-[0.2em] uppercase text-[9px] sm:text-[10px]">
                  Ronda Activa
                </span>
                <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase">{game.gameMode === 'WORDS' ? 'Palabras' : 'Fotos'}</span>
              </div>
            </div>

            <div className="w-full max-h-[60vh] flex items-center justify-center">
              <GameCard secret={game.currentSecret!} />
            </div>

            {(!game.isOnline || game.isHost) && (
              <button 
                onClick={game.goToVoting}
                className="w-full py-4 sm:py-5 mt-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-2xl font-black text-base sm:text-lg uppercase tracking-widest"
              >
                Terminar Discusión
              </button>
            )}
          </motion.div>
        )}

        {/* VOTING STATE */}
        {game.gameState === 'voting' && (
          <motion.div 
            key="voting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-6 sm:gap-8 z-10 px-2 sm:px-0"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter italic">Votación</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] px-6 sm:px-8 py-2 bg-white/5 rounded-full border border-white/10">
                {game.roles.find(r => r.role === 'Adivino')?.player}, señala al MENTIROSO
              </p>
            </div>

            {game.isOnline && game.roles.find(r => r.playerId === sessionManager.playerId)?.role !== 'Adivino' ? (
               <div className="flex flex-col items-center gap-6 py-12">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                 <p className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] text-center">
                   {game.roles.find(r => r.role === 'Adivino')?.player} está votando...
                 </p>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full overflow-y-auto max-h-[50vh] no-scrollbar">
                {game.roles.filter(r => r.role !== 'Adivino' && r.role !== 'Espectador').map((r, i) => (
                  <button
                    key={i}
                    onClick={() => game.submitVote(r.playerId)}
                    className="group relative p-6 sm:p-8 bg-white/5 border-2 border-white/10 rounded-3xl transition-all hover:bg-white/10 hover:border-blue-500/50 flex items-center gap-5 sm:gap-6 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="w-16 h-16 sm:w-20 h-20 rotate-12" />
                    </div>
                    <div className="w-12 h-12 sm:w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-2xl sm:text-3xl text-gray-300 uppercase">
                        {r.player[0]}
                    </div>
                    <div className="text-left relative z-10 truncate">
                        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter truncate">{r.player}</h3>
                        <p className="text-gray-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest">Señalar como Mentiroso</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* RESULT STATE */}
        {game.gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-4 sm:gap-6 z-10 px-2 sm:px-0"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">La Verdad</h2>

            <div className="w-full flex flex-col gap-3 overflow-y-auto max-h-[40vh] no-scrollbar pr-1">
              {game.roles.filter(r => r.role !== 'Espectador').map((r, i) => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  key={i} 
                  className={`relative overflow-hidden p-4 sm:p-6 rounded-2xl border-2 flex items-center justify-between transition-all duration-500 ${
                    r.role === 'Confidente' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                    r.role === 'Mentiroso' ? 'border-rose-500/50 bg-rose-500/5' :
                    'border-blue-500/50 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                    <div className={`p-3 sm:p-4 rounded-2xl ${
                      r.role === 'Confidente' ? 'bg-emerald-500/20' : 
                      r.role === 'Mentiroso' ? 'bg-rose-500/20' : 
                      'bg-blue-500/20'
                    }`}>
                      {r.role === 'Confidente' ? <ShieldCheck className="w-6 h-6 sm:w-8 h-8 text-emerald-400" /> : 
                       r.role === 'Mentiroso' ? <AlertTriangle className="w-6 h-6 sm:w-8 h-8 text-rose-400" /> :
                       <Target className="w-6 h-6 sm:w-8 h-8 text-blue-400" />}
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate max-w-[150px]">{r.player}</h3>
                      <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${
                        r.role === 'Confidente' ? 'text-emerald-400' : 
                        r.role === 'Mentiroso' ? 'text-rose-400' : 
                        'text-blue-400'
                      }`}>
                        {r.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-2 w-full">
               <h3 className="text-center text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3">Marcador</h3>
               <div className="max-h-[30vh] overflow-y-auto no-scrollbar">
                 <Scoreboard players={game.isOnline ? sessionManager.onlinePlayers : (sessionManager.activeSession?.players || [])} scoringMode={game.scoringMode} compact />
               </div>
            </div>

            <div className="flex w-full gap-3 mt-2">
              <Link
                href="/"
                onClick={() => game.isOnline && game.isHost && sessionManager.leaveRoom()}
                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10"
              >
                <HomeIcon className="w-4 h-4" />
                Hub
              </Link>
              {(!game.isOnline || game.isHost) ? (
                <button 
                  onClick={game.nextRound}
                  className="flex-[2] py-4 bg-blue-600 rounded-2xl font-black text-base shadow-2xl uppercase tracking-widest text-white hover:bg-blue-500 transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <div className="flex-[2] py-4 bg-white/5 rounded-2xl font-black text-xs flex justify-center items-center gap-2 uppercase tracking-widest text-blue-400/60 animate-pulse border border-blue-500/10">
                   Esperando al Host...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* GAME OVER STATE */}
        {game.gameState === 'game_over' && (
          <motion.div 
            key="game_over"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-6 sm:gap-8 z-10 px-2 sm:px-0"
          >
             <div className="text-center space-y-3">
                <Skull className="w-16 h-16 sm:w-24 h-24 text-rose-500 mx-auto animate-bounce" />
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic">FIN</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Partida Terminada</p>
             </div>

             <div className="w-full max-h-[40vh] overflow-y-auto no-scrollbar">
               <Scoreboard players={game.isOnline ? sessionManager.onlinePlayers : (sessionManager.activeSession?.players || [])} scoringMode={game.scoringMode} />
             </div>

             <Link
                href="/"
                onClick={() => game.isOnline && game.isHost && sessionManager.leaveRoom()}
                className="w-full py-5 bg-white text-black rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
              >
                <HomeIcon className="w-6 h-6" />
                Volver al Hub
              </Link>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
