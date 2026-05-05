'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Settings, Info, Clock, Check, X, RotateCcw, 
  EyeOff, ShieldCheck, AlertTriangle, Image as ImageIcon, 
  Type, LayoutGrid, Trophy, Heart, Skull, Zap, Target, Swords, UserCheck, Users, Plus
} from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameCard } from '../components/GameCard';
import { WORD_CATEGORIES } from '../constants/words';
import { Scoreboard } from '../components/Scoreboard';
import { ScoringMode, Player } from '../lib/types';
import { InstructionsModal } from '../components/InstructionsModal';
import { SessionPicker } from '../components/SessionPicker';
import { PlayerLobby } from '../components/PlayerLobby';

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

export default function Home() {
  const game = useGameLogic();
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Helper to handle player additions/removals in lobby
  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      score: 0,
      hp: 5,
      isEliminated: false
    };
    game.sessionManager.updateActiveSessionPlayers([...(game.sessionManager.activeSession?.players || []), newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    game.sessionManager.updateActiveSessionPlayers(
      (game.sessionManager.activeSession?.players || []).filter(p => p.id !== id)
    );
  };

  const handleUpdatePlayer = (id: string, name: string) => {
    game.sessionManager.updateActiveSessionPlayers(
      (game.sessionManager.activeSession?.players || []).map(p => p.id === id ? { ...p, name } : p)
    );
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0f111a] to-black min-h-screen">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

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
            className="flex flex-col items-center max-w-md w-full gap-8 z-10"
          >
            <div className="text-center">
              <motion.h1 
                initial={{ letterSpacing: '0.1em' }}
                animate={{ letterSpacing: '0.01em' }}
                className="text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 drop-shadow-2xl"
              >
                CONFIDENTE
              </motion.h1>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 italic tracking-widest">
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
                <span className="text-xl font-bold tracking-[0.2em] uppercase">Nueva Partida</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsInstructionsOpen(true)}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-transparent border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400 col-span-2"
                >
                  <Info className="w-5 h-5" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Cómo Jugar</span>
                </button>
              </div>
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
            className="w-full max-w-md z-10"
          >
            <SessionPicker 
              sessions={game.sessionManager.sessions}
              onSelect={(id) => {
                game.sessionManager.setActiveSessionId(id);
                game.goToGroupManage();
              }}
              onCreate={(name) => {
                game.sessionManager.createSession(name);
                game.goToGroupManage();
              }}
              onDelete={game.sessionManager.deleteSession}
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
            className="w-full max-w-md z-10"
          >
            <PlayerLobby 
              players={game.sessionManager.activeSession?.players || []}
              onAdd={handleAddPlayer}
              onRemove={handleRemovePlayer}
              onUpdate={handleUpdatePlayer}
              onContinue={() => game.setGameState('scoring_select')}
            />
            <button onClick={() => game.setGameState('session_select')} className="mt-6 w-full text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              Cambiar Sesión
            </button>
          </motion.div>
        )}

        {/* SCORING SELECT STATE */}
        {game.gameState === 'scoring_select' && (
          <motion.div 
            key="scoring_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center max-w-md w-full gap-8 z-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Reglas de Puntuación</h2>
              <p className="text-gray-400 font-medium italic">¿Cómo quieres que se ganen los puntos?</p>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
              {(Object.entries(SCORING_DESCRIPTIONS) as [ScoringMode, any][]).map(([mode, data]) => {
                const Icon = data.icon;
                return (
                  <button 
                    key={mode}
                    onClick={() => game.selectScoring(mode)}
                    className={`group p-4 bg-white/5 border rounded-2xl transition-all hover:bg-white/10 flex items-center gap-5 ${
                      game.scoringMode === mode ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-xl bg-white/5 ${data.color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight">{data.title}</h3>
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{data.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={game.goToGroupManage} className="text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              Volver a Jugadores
            </button>
          </motion.div>
        )}

        {/* MODE SELECT STATE */}
        {game.gameState === 'mode_select' && (
          <motion.div 
            key="mode_select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center max-w-md w-full gap-8 z-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">¿Qué quieres adivinar?</h2>
              <p className="text-gray-400 font-medium">Elige el tipo de contenido para esta ronda</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              <button 
                onClick={() => game.selectMode('WORDS')}
                className="group p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-2xl transition-all hover:scale-[1.02] hover:border-indigo-400 flex items-center gap-6"
              >
                <div className="p-4 bg-indigo-500/20 rounded-xl group-hover:bg-indigo-500/30 transition-colors">
                  <Type className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Palabras</h3>
                  <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest">Conceptos, objetos y acciones</p>
                </div>
              </button>

              <button 
                onClick={() => game.selectMode('IMAGES')}
                className="group p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/30 rounded-2xl transition-all hover:scale-[1.02] hover:border-blue-400 flex items-center gap-6"
              >
                <div className="p-4 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                  <ImageIcon className="w-10 h-10 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Fotos</h3>
                  <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-widest">Imágenes aleatorias de internet</p>
                </div>
              </button>
            </div>

            <button onClick={() => game.setGameState('scoring_select')} className="text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
              Volver a Reglas
            </button>
          </motion.div>
        )}

        {/* SETUP STATE */}
        {game.gameState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col w-full max-w-md gap-6 z-10"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
                <Settings className="w-8 h-8 text-blue-400" />
                Ajustes
              </h2>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 bg-white/5 border-white/10 overflow-y-auto max-h-[70vh] no-scrollbar">
              
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Categorías
                </h3>
                <div className="flex flex-wrap gap-3">
                  {game.gameMode === 'WORDS' ? (
                    Object.entries(WORD_CATEGORIES).map(([key, cat]) => {
                      const isSelected = game.categories.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => game.toggleCategory(key)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-bold ${
                            isSelected 
                              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                              : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    Object.entries(IMAGE_CATEGORY_ICONS).map(([cat, icon]) => {
                      const isSelected = game.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => game.toggleCategory(cat)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-bold ${
                            isSelected 
                              ? 'bg-blue-500/20 border-blue-400 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                              : 'bg-transparent border-white/5 text-gray-500 hover:border-white/10'
                          }`}
                        >
                          <span>{icon}</span>
                          <span className="capitalize">{cat === 'flags' ? 'Banderas' : cat}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tiempo de Ronda
                </h3>
                <div className="flex gap-2">
                  {[30, 60, 120, Infinity].map(t => (
                    <button
                      key={t}
                      onClick={() => game.setRoundTime(t)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-mono font-bold ${
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
                className="py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
              >
                Volver
              </button>
              <button 
                onClick={game.startRound}
                disabled={game.categories.length === 0 || game.isLoading}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex justify-center uppercase tracking-widest text-white"
              >
                {game.isLoading ? 'Preparando...' : '¡A Jugar!'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ASSIGNMENT STATE */}
        {game.gameState === 'assignment' && (
          <motion.div 
            key="assignment"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center text-center w-full max-w-md gap-6 z-10"
          >
            <div className="bg-orange-500/10 text-orange-400 border border-orange-500/20 p-5 rounded-2xl flex items-center gap-4 w-full">
              <div className="p-3 bg-orange-500/20 rounded-full animate-pulse">
                <EyeOff className="w-6 h-6" />
              </div>
              <p className="font-bold text-left text-sm uppercase tracking-tight">¡El Adivino NO debe mirar la pantalla!</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl w-full flex flex-col gap-6 bg-white/5 border-white/10">
              <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Asignación de Roles</h2>
              
              <div className="flex flex-col gap-3">
                {game.roles.map((r, i) => (
                  <div key={i} className={`flex justify-between items-center p-5 rounded-2xl border ${
                    r.role === 'Espectador' ? 'bg-black/20 border-white/5 opacity-50' : 'bg-black/40 border-white/10'
                  }`}>
                    <span className="font-black text-white text-lg tracking-tight uppercase">{r.player}</span>
                    <span className={`font-black text-[10px] px-4 py-2 rounded-full tracking-widest uppercase shadow-xl ${
                      r.role === 'Confidente' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 
                      r.role === 'Mentiroso' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30' :
                      r.role === 'Adivino' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30' :
                      'text-gray-500 bg-white/5 border border-white/5'
                    }`}>
                      {r.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={game.beginPlay}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform shadow-2xl uppercase tracking-widest"
            >
              ¡Entendido!
            </button>
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {game.gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-6 z-10"
          >
            <div className="w-full flex justify-between items-center px-2">
              <div className="px-5 py-2 bg-gray-800/80 backdrop-blur-xl rounded-full font-mono text-2xl font-bold border border-white/10 flex items-center gap-3 text-white">
                <Clock className="w-6 h-6 text-indigo-400" />
                {game.roundTime === Infinity ? '∞' : `00:${game.timeLeft.toString().padStart(2, '0')}`}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-indigo-400 font-black tracking-[0.2em] uppercase text-[10px]">
                  Ronda Activa
                </span>
                <span className="text-white/40 text-xs font-bold uppercase">{game.gameMode === 'WORDS' ? 'Palabras' : 'Fotos'}</span>
              </div>
            </div>

            <GameCard secret={game.currentSecret!} />

            <button 
              onClick={game.goToVoting}
              className="w-full py-5 mt-4 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-100 rounded-2xl font-black text-lg transition-all uppercase tracking-widest"
            >
              Terminar Discusión
            </button>
          </motion.div>
        )}

        {/* VOTING STATE */}
        {game.gameState === 'voting' && (
          <motion.div 
            key="voting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-8 z-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Votación Final</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] px-8 py-2 bg-white/5 rounded-full border border-white/10">
                {game.roles.find(r => r.role === 'Adivino')?.player}, elige quién es el MENTIROSO
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              {game.roles.filter(r => r.role !== 'Adivino' && r.role !== 'Espectador').map((r, i) => (
                <button
                  key={i}
                  onClick={() => game.submitVote(r.playerId)}
                  className="group relative p-8 bg-white/5 border-2 border-white/10 rounded-3xl transition-all hover:bg-white/10 hover:border-blue-500/50 hover:scale-[1.02] flex items-center gap-6 overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Target className="w-20 h-20 rotate-12" />
                   </div>
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center font-black text-3xl text-gray-300 group-hover:text-blue-400 transition-colors uppercase">
                      {r.player[0]}
                   </div>
                   <div className="text-left relative z-10">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{r.player}</h3>
                      <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Señalar como Mentiroso</p>
                   </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT STATE */}
        {game.gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-6 z-10"
          >
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">La Verdad</h2>

            <div className="w-full flex flex-col gap-4">
              {game.roles.filter(r => r.role !== 'Espectador').map((r, i) => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  key={i} 
                  className={`relative overflow-hidden p-6 rounded-2xl border-2 flex items-center justify-between transition-all duration-500 ${
                    r.role === 'Confidente' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                    r.role === 'Mentiroso' ? 'border-rose-500/50 bg-rose-500/5' :
                    'border-blue-500/50 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`p-4 rounded-2xl ${
                      r.role === 'Confidente' ? 'bg-emerald-500/20' : 
                      r.role === 'Mentiroso' ? 'bg-rose-500/20' : 
                      'bg-blue-500/20'
                    }`}>
                      {r.role === 'Confidente' ? <ShieldCheck className="w-8 h-8 text-emerald-400" /> : 
                       r.role === 'Mentiroso' ? <AlertTriangle className="w-8 h-8 text-rose-400" /> :
                       <Target className="w-8 h-8 text-blue-400" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{r.player}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
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

            <div className="mt-4 w-full">
               <h3 className="text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Marcador Actual</h3>
               <Scoreboard players={game.sessionManager.activeSession?.players || []} scoringMode={game.scoringMode} />
            </div>

            <div className="flex w-full gap-4 mt-4">
              <button 
                onClick={game.resetGame}
                className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-gray-400"
              >
                <X className="w-5 h-5" />
                Salir
              </button>
              <button 
                onClick={game.nextRound}
                className="flex-[2] py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-2xl uppercase tracking-widest text-white"
              >
                <RotateCcw className="w-5 h-5" />
                Siguiente
              </button>
            </div>
          </motion.div>
        )}

        {/* GAME OVER STATE */}
        {game.gameState === 'game_over' && (
          <motion.div 
            key="game_over"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md gap-8 z-10"
          >
             <div className="text-center space-y-4">
                <Skull className="w-24 h-24 text-rose-500 mx-auto animate-bounce" />
                <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">FIN DE SESIÓN</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Alguien ha caído en combate</p>
             </div>

             <Scoreboard players={game.sessionManager.activeSession?.players || []} scoringMode={game.scoringMode} />

             <button 
                onClick={game.resetGame}
                className="w-full py-6 bg-white text-black rounded-3xl font-black text-xl hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)] uppercase tracking-widest"
              >
                Cerrar Sesión
              </button>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
