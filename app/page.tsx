'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Users, LayoutGrid, Plus, 
  ArrowRight, Star, Zap, Ghost, EyeOff 
} from 'lucide-react';
import Link from 'next/link';
import { useGlobalContext } from '../context/GlobalContext';
import { GameInfo } from '../lib/types';

const GAMES: GameInfo[] = [
  {
    id: 'confidente-mentiroso',
    title: 'Confidente y Mentiroso',
    description: 'Descubre quién dice la verdad en este juego de deducción social.',
    icon: '🕵️',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'impostor',
    title: 'El Impostor',
    description: 'Todos tienen la palabra secreta... ¡excepto uno!',
    icon: '🎭',
    color: 'from-rose-600 to-red-700',
    isNew: true
  },
  {
    id: 'trivia-caotica',
    title: 'Trivia Caótica',
    description: 'Preguntas locas donde la rapidez es lo más importante.',
    icon: '🧠',
    color: 'from-emerald-600 to-teal-700',
    isBeta: true
  }
];

export default function GameHub() {
  const { activeSession, sessions, createSession } = useGlobalContext();

  const handleQuickSession = () => {
    createSession(`Sesión ${new Date().toLocaleDateString()}`);
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[#0a0b14] text-white overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Top Bar */}
      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
            <Gamepad2 className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">Gamer<span className="text-blue-500">Hub</span></h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Plataforma Social</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!activeSession ? (
            <button 
              onClick={handleQuickSession}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Sesión
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 pl-4 rounded-2xl">
               <div className="hidden sm:block">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Sesión</p>
                  <p className="text-xs font-bold text-blue-400 truncate max-w-[100px]">{activeSession.name}</p>
               </div>
               <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                  {activeSession.players.length}
               </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-10 flex flex-col items-center text-center z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter uppercase"
        >
          ¿A qué jugamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">hoy</span>?
        </motion.h2>
        <p className="text-gray-400 max-w-lg font-medium leading-relaxed">
          Selecciona un juego de la biblioteca y empieza a competir con tus amigos. Tu puntuación se mantendrá en toda la sesión.
        </p>
      </section>

      {/* Game Catalog */}
      <section className="px-6 py-10 flex-1 z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-8">
           <LayoutGrid className="w-5 h-5 text-gray-500" />
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">Catálogo de Juegos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                href={game.id === 'confidente-mentiroso' || game.id === 'impostor' ? `/juego/${game.id}` : '#'}
                className={`group relative flex flex-col h-full bg-gradient-to-br ${game.color} rounded-[2.5rem] p-8 overflow-hidden shadow-2xl hover:scale-[1.03] transition-all duration-500 border border-white/10`}
              >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Gamepad2 className="w-32 h-32" />
                </div>

                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl shadow-xl">
                    {game.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    {game.isNew && (
                      <span className="px-3 py-1 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Nuevo</span>
                    )}
                    {game.isBeta && (
                      <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Beta</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto relative z-10">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{game.title}</h4>
                  <p className="text-white/70 text-sm font-medium leading-relaxed mb-6">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px]">
                    Jugar Ahora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
              </Link>
            </motion.div>
          ))}

          {/* Placeholder for "Add Game" */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: GAMES.length * 0.1 }}
            className="group flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 hover:bg-white/5 transition-all min-h-[350px]"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Próximamente</p>
          </motion.button>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="p-8 text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em]">
        Construido para la Diversión Social &bull; v2.0
      </footer>
    </main>
  );
}
