'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, ScoringMode } from '../lib/types';
import { Trophy, Heart, Skull } from 'lucide-react';

interface ScoreboardProps {
  players: Player[];
  scoringMode: ScoringMode;
  compact?: boolean;
}

export function Scoreboard({ players, scoringMode, compact = false }: ScoreboardProps) {
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
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                player.id === '1' ? 'bg-blue-500/20 text-blue-400' : 
                player.id === '2' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {player.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-white uppercase tracking-tight text-sm">
                  {player.name}
                </h4>
                {player.isEliminated && (
                  <span className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                    <Skull className="w-3 h-3" /> Eliminado
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {scoringMode === 'MUERTE' ? (
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-4 h-4 ${i < player.hp ? 'text-rose-500 fill-rose-500' : 'text-gray-700'}`} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-mono font-bold text-white">{player.score}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
