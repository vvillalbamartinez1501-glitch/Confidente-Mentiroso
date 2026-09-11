'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, Sparkles } from 'lucide-react';
import { RouletteRoom, RoulettePlayer } from '@/lib/spotifyRouletteTypes';

interface PlayerLobbyProps {
  room: RouletteRoom;
  player: RoulettePlayer;
}

export function PlayerLobby({ room, player }: PlayerLobbyProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto px-4 py-8 text-center">
      {/* Badge */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        Room {room.code}
      </div>

      {/* Player Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 flex flex-col items-center shadow-xl backdrop-blur-xl mb-6"
      >
        <img
          src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
          alt={player.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-lg mb-4"
        />
        <h2 className="text-2xl font-black text-white">
          {player.name}
        </h2>
        <span className="text-xs text-emerald-400 font-semibold mt-1">
          Connected via Spotify
        </span>

        {/* Pulsing radar */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-emerald-500/30 animate-ping" />
            <Radio className="w-8 h-8 text-emerald-400 relative z-10" />
          </div>
          <span className="text-sm font-bold text-neutral-300 mt-2">
            Waiting for Host to Start...
          </span>
          <p className="text-xs text-neutral-400">
            Keep your phone ready. Songs will play out loud from the Host&apos;s device!
          </p>
        </div>
      </motion.div>

      {/* Connected Friends Preview */}
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
          <span className="flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-emerald-400" />
            Players in Lobby
          </span>
          <span>{room.players.length} Total</span>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-2">
          {room.players.map((p) => (
            <span
              key={p.spotifyId}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                p.spotifyId === player.spotifyId 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
