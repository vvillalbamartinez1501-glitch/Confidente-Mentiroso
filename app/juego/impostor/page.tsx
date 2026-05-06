'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Settings, Info, Clock, Check, X, 
  ShieldCheck, AlertTriangle, Type, LayoutGrid, 
  Target, Swords, UserCheck, Home as HomeIcon, Ghost
} from 'lucide-react';
import { useGlobalContext } from '../../../context/GlobalContext';
import { getRandomSecret } from '../../../lib/contentManager';
import { WordCategory } from '../../../constants/words';
import Link from 'next/link';

export default function ImpostorPage() {
  const sessionManager = useGlobalContext();
  const [gameState, setGameState] = useState<'home' | 'setup' | 'playing' | 'result'>('home');
  const [category, setCategory] = useState<WordCategory>('random');
  const [secretWord, setSecretWord] = useState('');
  const [roles, setRoles] = useState<{ playerName: string, isImpostor: boolean }[]>([]);
  const [showRole, setShowRole] = useState(false);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const startSetup = () => setGameState('setup');

  const startGame = async () => {
    const secret = await getRandomSecret('WORDS', [category]);
    setSecretWord(secret.content);
    
    const players = sessionManager.activeSession?.players || [];
    if (players.length < 3) {
      alert("Necesitas al menos 3 jugadores en la sesión.");
      return;
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const impostorId = shuffled[0].id;

    const assignedRoles = players.map(p => ({
      playerName: p.name,
      isImpostor: p.id === impostorId
    }));

    setRoles(assignedRoles);
    setCurrentPlayerIdx(0);
    setGameState('playing');
    setShowRole(false);
  };

  const nextPlayer = () => {
    if (currentPlayerIdx < roles.length - 1) {
      setCurrentPlayerIdx(prev => prev + 1);
      setShowRole(false);
    } else {
      setGameState('result');
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#1a0f11] to-black min-h-screen">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-black/20 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <HomeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Hub</span>
        </Link>
        <h1 className="text-xl font-black italic tracking-tighter text-rose-500 uppercase">El Impostor</h1>
      </div>

      <InstructionsModal 
        isOpen={isInstructionsOpen} 
        onClose={() => setIsInstructionsOpen(false)} 
        gameId="impostor"
      />

      <AnimatePresence mode="wait">
        {gameState === 'home' && (
          <motion.div key="home" className="flex flex-col items-center gap-8 z-10 text-center">
            <div className="p-6 bg-rose-500/20 rounded-full animate-pulse">
              <Ghost className="w-20 h-20 text-rose-500" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">El Impostor</h2>
              <p className="text-gray-400 max-w-xs mx-auto">Uno de vosotros no conoce la palabra. ¿Quién será?</p>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={startSetup}
                className="px-10 py-5 bg-rose-600 rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:bg-rose-500 transition-all"
              >
                Comenzar
              </button>
              <button 
                onClick={() => setIsInstructionsOpen(true)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" />
                Cómo Jugar
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'setup' && (
          <motion.div key="setup" className="w-full max-w-md flex flex-col gap-6 z-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center">Configuración</h3>
            <div className="glass-panel p-6 rounded-3xl bg-white/5 border border-white/10">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block text-center">Selecciona Categoría</label>
               <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as WordCategory)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-bold"
               >
                 <option value="random">Cualquier Palabra</option>
                 <option value="lugares">Lugares</option>
                 <option value="objetos">Objetos</option>
                 <option value="personajes">Personajes</option>
               </select>
            </div>
            <button 
              onClick={startGame}
              className="w-full py-5 bg-rose-600 rounded-2xl font-black text-lg uppercase tracking-widest"
            >
              ¡Repartir Palabra!
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" className="w-full max-w-md flex flex-col items-center gap-8 z-10">
            <div className="text-center">
              <p className="text-rose-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Turno de</p>
              <h3 className="text-4xl font-black text-white uppercase">{roles[currentPlayerIdx].playerName}</h3>
            </div>

            <div className="w-full aspect-square max-w-[300px]">
              <button 
                onClick={() => setShowRole(!showRole)}
                className={`w-full h-full rounded-[3rem] border-4 flex flex-col items-center justify-center gap-4 transition-all duration-500 ${
                  showRole ? 'bg-rose-500/10 border-rose-500/50' : 'bg-white/5 border-white/10'
                }`}
              >
                {!showRole ? (
                  <>
                    <Target className="w-12 h-12 text-gray-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Pulsa para ver</p>
                  </>
                ) : (
                  <>
                    {roles[currentPlayerIdx].isImpostor ? (
                      <>
                        <Ghost className="w-16 h-16 text-rose-500" />
                        <h4 className="text-2xl font-black text-rose-500 uppercase italic">ERES EL IMPOSTOR</h4>
                        <p className="text-xs text-gray-400 font-bold px-8">No conoces la palabra. ¡Finge que sí!</p>
                      </>
                    ) : (
                      <>
                        <Type className="w-16 h-16 text-emerald-400" />
                        <p className="text-[10px] font-black uppercase text-emerald-500/60">La palabra secreta es:</p>
                        <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{secretWord}</h4>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            {showRole && (
              <button 
                onClick={nextPlayer}
                className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg uppercase tracking-widest"
              >
                {currentPlayerIdx < roles.length - 1 ? 'Siguiente Jugador' : 'Terminar Reparto'}
              </button>
            )}
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div key="result" className="flex flex-col items-center gap-8 z-10 text-center">
            <h3 className="text-4xl font-black text-white uppercase">¡A Discutir!</h3>
            <p className="text-gray-400">Tenéis que descubrir quién es el Impostor.</p>
            <div className="flex gap-4 w-full">
              <Link href="/" className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <HomeIcon className="w-4 h-4" />
                Salir al Hub
              </Link>
              <button onClick={() => setGameState('home')} className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs">
                Nueva Ronda
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
