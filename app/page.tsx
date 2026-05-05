'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Settings, Info, Clock, Check, X, RotateCcw, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { GameCard } from '../components/GameCard';
import { Category } from '../lib/imageLoader';

const CATEGORY_ICONS: Record<Category, string> = {
  flags: '🌍',
  memes: '😂',
  movies: '🎬',
  objects: '📦',
  geek: '👾'
};

export default function Home() {
  const game = useGameLogic();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0f111a] to-black">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

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
              <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
                Confidente
              </h1>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 italic">
                y Mentiroso
              </h2>
            </div>
            
            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={game.startGameSetup}
                className="group relative flex items-center justify-center gap-3 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="w-6 h-6" />
                <span className="text-xl font-bold tracking-wide">JUGAR</span>
              </button>

              <button className="flex items-center justify-center gap-3 w-full py-4 bg-transparent border border-gray-600 rounded-xl hover:bg-gray-800 transition-all text-gray-300">
                <Info className="w-5 h-5" />
                <span className="font-semibold">Cómo jugar</span>
              </button>
            </div>
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
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="w-8 h-8 text-blue-400" />
                Ajustes
              </h2>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-300">Categorías</h3>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(CATEGORY_ICONS) as Category[]).map(cat => {
                  const isSelected = game.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => game.toggleCategory(cat)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        isSelected 
                          ? 'bg-blue-500/20 border-blue-400 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                          : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span className="capitalize">{cat === 'flags' ? 'Banderas' : cat}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tiempo de Ronda
                </h3>
                <div className="flex gap-2">
                  {[30, 60, Infinity].map(t => (
                    <button
                      key={t}
                      onClick={() => game.setRoundTime(t)}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        game.roundTime === t
                          ? 'bg-purple-500/20 border-purple-400 text-purple-100'
                          : 'bg-gray-800 border-gray-600 text-gray-400'
                      }`}
                    >
                      {t === Infinity ? '∞' : `${t}s`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={game.startRound}
              disabled={game.categories.length === 0 || game.isLoading}
              className="mt-4 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex justify-center"
            >
              {game.isLoading ? 'Cargando...' : 'Empezar Ronda'}
            </button>
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
            <div className="bg-red-500/20 text-red-200 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 w-full shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <EyeOff className="w-8 h-8 flex-shrink-0" />
              <p className="font-bold text-left">¡El Adivino NO debe mirar la pantalla a partir de ahora!</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl w-full flex flex-col gap-6">
              <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Roles de Informantes</h2>
              
              <div className="flex flex-col gap-4">
                {game.roles.map((r, i) => (
                  <div key={i} className="flex justify-between items-center bg-black/40 p-4 rounded-lg border border-white/5">
                    <span className="font-semibold text-xl">{r.player}</span>
                    <span className={`font-bold text-lg px-3 py-1 rounded shadow-sm ${
                      r.role === 'Confidente' 
                        ? 'text-truth bg-truth/10 border border-truth/30' 
                        : 'text-lie bg-lie/10 border border-lie/30'
                    }`}>
                      {r.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={game.beginPlay}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors mt-2"
            >
              ¡Entendido, a jugar!
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
              <div className="px-4 py-2 bg-gray-800 rounded-full font-mono text-xl border border-gray-600 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                {game.roundTime === Infinity ? '∞' : `00:${game.timeLeft.toString().padStart(2, '0')}`}
              </div>
              <span className="text-gray-400 font-semibold tracking-widest uppercase text-sm">
                Ronda Activa
              </span>
            </div>

            <GameCard image={game.currentImage} />

            <button 
              onClick={game.revealResult}
              className="w-full py-4 mt-4 bg-red-600/20 border border-red-500/50 hover:bg-red-600/40 text-red-100 rounded-xl font-bold text-lg transition-all"
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
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
              ¡Tiempo!
            </h2>

            <div className="w-full flex flex-col gap-4">
              {game.roles.map((r, i) => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.3 }}
                  key={i} 
                  className={`relative overflow-hidden p-6 rounded-2xl border-2 flex items-center justify-between ${
                    r.role === 'Confidente'
                      ? 'border-truth/50 bg-truth/5 shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                      : 'border-lie/50 bg-lie/5 shadow-[0_0_20px_rgba(255,51,102,0.15)]'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-3 rounded-full ${r.role === 'Confidente' ? 'bg-truth/20' : 'bg-lie/20'}`}>
                      {r.role === 'Confidente' ? <ShieldCheck className="w-8 h-8 text-truth" /> : <AlertTriangle className="w-8 h-8 text-lie" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{r.player}</h3>
                      <p className={`text-lg font-semibold ${r.role === 'Confidente' ? 'text-truth' : 'text-lie'}`}>
                        {r.role === 'Confidente' ? 'Dijo la Verdad' : 'Era el Mentiroso'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex w-full gap-4 mt-8">
              <button 
                onClick={game.resetGame}
                className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Salir
              </button>
              <button 
                onClick={game.nextRound}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                <RotateCcw className="w-5 h-5" />
                Siguiente Ronda
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
