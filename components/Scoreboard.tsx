'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, ScoringMode } from '../lib/types';
import { Trophy, Heart, Skull, Edit2, Check, Plus, Minus } from 'lucide-react';

interface ScoreboardProps {
  players: Player[];
  scoringMode: ScoringMode;
  compact?: boolean;
  onUpdateName?: (id: string, name: string) => void;
  onAdjustScore?: (id: string, delta: number) => void;
  onAdjustHP?: (id: string, delta: number) => void;
}

export function Scoreboard({ 
  players, 
  scoringMode, 
  compact = false,
  onUpdateName,
  onAdjustScore,
  onAdjustHP
}: ScoreboardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setTempName(player.name);
  };

  const saveName = (id: string) => {
    if (onUpdateName && tempName.trim()) {
      onUpdateName(id, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className={`w-full ${compact ? 'max-w-xs' : 'max-w-md'} flex flex-col gap-3`}>
      <AnimatePresence>
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative flex items-center justify-between p-4 rounded-xl border-2 backdrop-blur-md transition-all ${
              player.isEliminated 
                ? 'bg-red-900/20 border-red-900/50 grayscale' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                player.id === '1' ? 'bg-blue-500/20 text-blue-400' : 
                player.id === '2' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {player.name[0]}
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                {editingId === player.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => saveName(player.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveName(player.id)}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white font-bold w-full outline-none focus:border-blue-500"
                    />
                    <button onClick={() => saveName(player.id)} className="text-emerald-400">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h4 className="font-bold text-white uppercase tracking-tight text-sm truncate">
                      {player.name}
                    </h4>
                    {onUpdateName && (
                      <button 
                        onClick={() => startEditing(player)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                {player.isEliminated && (
                  <span className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                    <Skull className="w-3 h-3" /> Eliminado
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
              {scoringMode === 'MUERTE' ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-4 rounded-sm ${i < player.hp ? 'bg-rose-500' : 'bg-gray-800'} ${i >= 5 ? 'hidden' : ''}`} 
                      />
                    ))}
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 ml-1" />
                  </div>
                  {onAdjustHP && !player.isEliminated && (
                    <div className="flex items-center gap-2 bg-black/20 rounded-full border border-white/5 p-1">
                      <button onClick={() => onAdjustHP(player.id, -1)} className="p-0.5 hover:bg-white/10 rounded-full transition-colors">
                        <Minus className="w-3 h-3 text-rose-400" />
                      </button>
                      <span className="text-[10px] font-bold text-white w-3 text-center">{player.hp}</span>
                      <button onClick={() => onAdjustHP(player.id, 1)} className="p-0.5 hover:bg-white/10 rounded-full transition-colors">
                        <Plus className="w-3 h-3 text-emerald-400" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="font-mono font-bold text-white">{player.score}</span>
                  </div>
                  {onAdjustScore && (
                    <div className="flex items-center gap-2 bg-black/20 rounded-full border border-white/5 p-1">
                      <button onClick={() => onAdjustScore(player.id, -1)} className="p-0.5 hover:bg-white/10 rounded-full transition-colors">
                        <Minus className="w-3 h-3 text-red-400" />
                      </button>
                      <button onClick={() => onAdjustScore(player.id, 1)} className="p-0.5 hover:bg-white/10 rounded-full transition-colors">
                        <Plus className="w-3 h-3 text-emerald-400" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
