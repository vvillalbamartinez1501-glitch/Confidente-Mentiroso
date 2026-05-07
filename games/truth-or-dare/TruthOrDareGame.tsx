'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MessageCircle, ArrowLeft } from 'lucide-react';
import { Player } from '../../lib/types';

interface TruthOrDareGameProps {
  players: Player[];
  currentPlayerIndex: number;
  lastAction: 'VERDAD' | 'RETO' | null;
  history: { player: string, type: 'VERDAD' | 'RETO' }[];
  onAction: (type: 'VERDAD' | 'RETO') => void;
  onBackToMenu: () => void;
}

export default function TruthOrDareGame({ 
  players, 
  currentPlayerIndex, 
  lastAction, 
  history, 
  onAction, 
  onBackToMenu 
}: TruthOrDareGameProps) {

  if (!players || players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900 rounded-3xl border border-white/10">
        <p className="text-gray-400 mb-4 font-bold uppercase tracking-widest">No hay jugadores activos</p>
        <button 
          onClick={onBackToMenu}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex % players.length];

  return (
    <div className="w-full max-w-md flex flex-col gap-8 relative z-10">
      
      {/* Header Info */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={onBackToMenu}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-gray-400 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Turno Actual</p>
          <p className="text-xs font-bold text-gray-500">Jugador {(currentPlayerIndex % players.length) + 1} de {players.length}</p>
        </div>
      </div>

      {/* Main Player Display */}
      <div className="relative h-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 border-4 border-white/10 relative">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
               >
                 <Flame className="w-10 h-10 text-white" />
               </motion.div>
               <div className="absolute inset-0 rounded-[2rem] border border-white/20 animate-ping opacity-20" />
            </div>
            
            <div className="text-center">
              <motion.h2 
                className="text-4xl font-black text-white uppercase tracking-tighter"
                layoutId="player-name"
              >
                {currentPlayer.name}
              </motion.h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Es tu turno</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !lastAction && onAction('VERDAD')}
          disabled={!!lastAction}
          className={`group relative overflow-hidden p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all border-2 ${
            lastAction === 'VERDAD' 
              ? 'bg-cyan-500 border-cyan-400 shadow-cyan-500/50' 
              : 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-400/50'
          }`}
        >
          <div className={`p-4 rounded-2xl ${lastAction === 'VERDAD' ? 'bg-white/20' : 'bg-cyan-500/20'}`}>
            <MessageCircle className={`w-8 h-8 ${lastAction === 'VERDAD' ? 'text-white' : 'text-cyan-400'}`} />
          </div>
          <span className={`font-black uppercase tracking-widest text-lg ${lastAction === 'VERDAD' ? 'text-white' : 'text-cyan-400'}`}>
            Verdad
          </span>
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <MessageCircle className="w-16 h-16 rotate-12" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !lastAction && onAction('RETO')}
          disabled={!!lastAction}
          className={`group relative overflow-hidden p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all border-2 ${
            lastAction === 'RETO' 
              ? 'bg-orange-600 border-orange-500 shadow-orange-600/50' 
              : 'bg-orange-600/10 border-orange-600/20 hover:border-orange-500/50'
          }`}
        >
          <div className={`p-4 rounded-2xl ${lastAction === 'RETO' ? 'bg-white/20' : 'bg-orange-600/20'}`}>
            <Flame className={`w-8 h-8 ${lastAction === 'RETO' ? 'text-white' : 'text-orange-400'}`} />
          </div>
          <span className={`font-black uppercase tracking-widest text-lg ${lastAction === 'RETO' ? 'text-white' : 'text-orange-400'}`}>
            Reto
          </span>
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Flame className="w-16 h-16 -rotate-12" />
          </div>
        </motion.button>
      </div>

      {/* Result Area */}
      <div className="glass-panel p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
        <AnimatePresence mode="wait">
          {lastAction ? (
            <motion.div
              key="action"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Seleccionado</p>
              <p className={`text-2xl font-black uppercase italic ${lastAction === 'VERDAD' ? 'text-cyan-400' : 'text-orange-400'}`}>
                {lastAction}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4"
            >
              <p className="text-sm font-medium text-gray-500 italic">
                Esperando elección...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History Feed */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2">
           <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-2">Últimos Turnos</h3>
           <div className="flex flex-col gap-2">
             {history.map((h, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 opacity-60">
                 <span className="text-xs font-bold text-white uppercase tracking-tight">{h.player}</span>
                 <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                   h.type === 'VERDAD' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'
                 }`}>
                   {h.type}
                 </span>
               </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
}
