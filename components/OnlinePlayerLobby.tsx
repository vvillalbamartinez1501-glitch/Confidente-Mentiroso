'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../lib/types';
import { 
  Users, Crown, LogOut, UserMinus, 
  Check, Loader2, Copy, Globe 
} from 'lucide-react';

interface OnlinePlayerLobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onKick?: (id: string) => void;
  onLeave: () => void;
  onStart: () => void;
}

export function OnlinePlayerLobby({ 
  roomCode, players, isHost, onKick, onLeave, onStart 
}: OnlinePlayerLobbyProps) {
  
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Código copiado: ' + roomCode);
  };

  return (
    <div className="flex flex-col w-full max-w-md gap-6">
      {/* Room Header */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Globe className="w-24 h-24" />
        </div>
        
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Sala Online</p>
        <h2 className="text-5xl font-black text-white tracking-tighter mb-4">{roomCode}</h2>
        
        <button 
          onClick={copyCode}
          className="mx-auto flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest text-gray-300"
        >
          <Copy className="w-3 h-3" />
          Copiar Código
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Jugadores Conectados</h3>
        </div>
        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {players.length} / 10
        </span>
      </div>

      <div className="flex flex-col gap-3 min-h-[200px]">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white relative ${
                  player.isHost ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                }`}>
                  {player.name[0].toUpperCase()}
                  {player.isHost && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-1 rounded-full border-2 border-[#0a0b14]">
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <span className="font-bold text-white uppercase tracking-tight">{player.name}</span>
              </div>

              {isHost && !player.isHost && (
                <button 
                  onClick={() => onKick?.(player.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <UserMinus className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          ))}
          
          {players.length < 3 && (
            <div className="flex-1 flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
              <Loader2 className="w-6 h-6 text-gray-600 animate-spin mb-2" />
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center px-8">
                Esperando a que más jugadores se unan...
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <button 
          onClick={onLeave}
          className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs flex justify-center items-center gap-2 uppercase tracking-widest text-gray-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {isHost ? 'Cerrar Sala' : 'Salir'}
        </button>

        {isHost ? (
          <button 
            onClick={onStart}
            disabled={players.length < 3}
            className="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-xs disabled:opacity-30 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-white"
          >
            <Check className="w-4 h-4" />
            Empezar Partida
          </button>
        ) : (
          <div className="py-4 bg-white/5 rounded-2xl font-black text-[10px] flex justify-center items-center gap-3 uppercase tracking-widest text-blue-400/60 text-center animate-pulse border border-blue-500/10">
            Esperando al Host
          </div>
        )}
      </div>
    </div>
  );
}
