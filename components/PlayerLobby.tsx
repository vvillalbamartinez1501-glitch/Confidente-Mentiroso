'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../lib/types';
import { UserPlus, Trash2, Edit3, User, Check, X, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

interface PlayerLobbyProps {
  players: Player[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
  onToggleSpectator: (id: string) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onContinue: () => void;
}

export function PlayerLobby({ players, onAdd, onRemove, onUpdate, onToggleSpectator, onReorder, onContinue }: PlayerLobbyProps) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setTempName(player.name);
  };

  const saveEdit = (id: string) => {
    if (tempName.trim()) {
      onUpdate(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col w-full max-w-md gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Jugadores</h2>
        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/5">
          Total: {players.length}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nombre del nuevo jugador..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <button 
          onClick={handleAdd}
          className="bg-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-900/20 hover:bg-purple-500 transition-all"
        >
          <UserPlus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
        <AnimatePresence>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`flex items-center justify-between p-4 border transition-all duration-300 rounded-2xl group ${
                player.isManualSpectator 
                ? 'bg-black/40 border-white/5 opacity-60 scale-[0.98]' 
                : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white transition-all ${
                  player.isManualSpectator ? 'bg-gray-700 grayscale' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                }`}>
                  {player.name[0].toUpperCase()}
                </div>
                
                {editingId === player.id ? (
                  <input 
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => saveEdit(player.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(player.id)}
                    className="bg-black/40 border border-purple-500/50 rounded-lg px-3 py-1 text-white font-bold outline-none w-full"
                  />
                ) : (
                  <div className="flex flex-col">
                    <span className={`font-bold uppercase tracking-tight text-lg transition-colors ${
                      player.isManualSpectator ? 'text-gray-500' : 'text-white'
                    }`}>
                      {player.name}
                    </span>
                    {player.isManualSpectator && (
                      <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">Espectador Manual</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId === player.id ? (
                  <button onClick={() => saveEdit(player.id)} className="p-2 text-emerald-400">
                    <Check className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <div className="flex flex-col mr-1">
                      <button 
                        onClick={() => onReorder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-white disabled:opacity-0 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onReorder(index, 'down')}
                        disabled={index === players.length - 1}
                        className="p-1 text-gray-600 hover:text-white disabled:opacity-0 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => onToggleSpectator(player.id)} 
                      className={`p-2 transition-colors ${player.isManualSpectator ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'}`}
                      title={player.isManualSpectator ? "Participar" : "Poner como espectador"}
                    >
                      {player.isManualSpectator ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button onClick={() => startEdit(player)} className="p-2 text-gray-500 hover:text-white transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onRemove(player.id)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button 
        onClick={onContinue}
        disabled={players.length < 3}
        className="mt-4 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-lg disabled:opacity-30 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex justify-center items-center gap-3 uppercase tracking-widest text-white"
      >
        <span>Continuar</span>
        <Check className="w-6 h-6" />
      </button>
      {players.length < 3 && (
        <p className="text-center text-[10px] text-rose-400 font-bold uppercase tracking-widest animate-pulse">
          Se requieren al menos 3 jugadores
        </p>
      )}
    </div>
  );
}
