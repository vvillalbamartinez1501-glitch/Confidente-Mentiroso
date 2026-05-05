'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Settings, Info, Clock, Check, X, RotateCcw, EyeOff, ShieldCheck, AlertTriangle, Image as ImageIcon, Type, LayoutGrid } from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameCard } from '../components/GameCard';
import { WORD_CATEGORIES } from '../constants/words';

const IMAGE_CATEGORY_ICONS: Record<string, string> = {
  flags: '🌍',
  memes: '😂',
  movies: '🎬',
  objects: '📦',
  geek: '👾'
};

export default function Home() {
  const game = useGameLogic();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0f111a] to-black min-h-screen">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

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
                <span className="text-xl font-bold tracking-[0.2em] uppercase">Comenzar</span>
              </button>

              <button className="flex items-center justify-center gap-3 w-full py-4 bg-transparent border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400">
                <Info className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-wider text-sm">Instrucciones</span>
              </button>
            </div>
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
                  <h3 className="text-2xl font-bold text-white">Palabras</h3>
                  <p className="text-indigo-300/60 text-sm">Conceptos, objetos y acciones</p>
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
                  <h3 className="text-2xl font-bold text-white">Fotos</h3>
                  <p className="text-blue-300/60 text-sm">Imágenes aleatorias de internet</p>
                </div>
              </button>
            </div>

            <button onClick={game.resetGame} className="text-gray-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors">
              Volver al inicio
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

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 bg-white/5 border-white/10">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Categorías {game.gameMode === 'WORDS' ? 'de Palabras' : 'de Imágenes'}
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
                onClick={() => game.selectMode(game.gameMode)} // Reset to mode select implicitly by changing state
                className="py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
                onClickCapture={() => game.startGameSetup()}
              >
                Volver
              </button>
              <button 
                onClick={game.startRound}
                disabled={game.categories.length === 0 || game.isLoading}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-lg disabled:opacity-50 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex justify-center uppercase tracking-widest"
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
                  <div key={i} className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
                    <span className="font-black text-white text-lg tracking-tight uppercase">{r.player}</span>
                    <span className={`font-black text-xs px-4 py-2 rounded-full tracking-widest uppercase shadow-xl ${
                      r.role === 'Confidente' 
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' 
                        : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
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
                <span className="text-white/40 text-xs font-bold">{game.gameMode === 'WORDS' ? 'Palabras' : 'Imágenes'}</span>
              </div>
            </div>

            <GameCard secret={game.currentSecret} />

            <button 
              onClick={game.revealResult}
              className="w-full py-5 mt-4 bg-rose-600/10 border border-rose-500/30 hover:bg-rose-600/20 text-rose-100 rounded-2xl font-black text-lg transition-all uppercase tracking-widest"
            >
              Revelar Mentiroso
            </button>
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
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">¡Tiempo!</h2>

            <div className="w-full flex flex-col gap-4">
              {game.roles.map((r, i) => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  key={i} 
                  className={`relative overflow-hidden p-6 rounded-2xl border-2 flex items-center justify-between transition-all duration-500 ${
                    r.role === 'Confidente'
                      ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]'
                      : 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_40px_rgba(244,63,94,0.1)]'
                  }`}
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`p-4 rounded-2xl ${r.role === 'Confidente' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                      {r.role === 'Confidente' ? <ShieldCheck className="w-8 h-8 text-emerald-400" /> : <AlertTriangle className="w-8 h-8 text-rose-400" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{r.player}</h3>
                      <p className={`text-sm font-bold uppercase tracking-widest ${r.role === 'Confidente' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.role === 'Confidente' ? 'Confidente' : 'Mentiroso'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex w-full gap-4 mt-8">
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

      </AnimatePresence>
    </main>
  );
}
