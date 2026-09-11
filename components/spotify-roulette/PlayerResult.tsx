'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Music, Clock } from 'lucide-react';
import { RouletteRoom, RoulettePlayer } from '@/lib/spotifyRouletteTypes';

interface PlayerResultProps {
  room: RouletteRoom;
  currentPlayer: RoulettePlayer;
}

export function PlayerResult({ room, currentPlayer }: PlayerResultProps) {
  const vote = room.votes?.[currentPlayer.spotifyId];
  const isCorrect = vote?.isCorrect ?? false;
  const points = vote?.pointsAwarded ?? 0;
  const isTarget = room.targetPlayerId === currentPlayer.spotifyId;
  const targetPlayer = room.players.find((p) => p.spotifyId === room.targetPlayerId);
  const track = room.currentTrack;

  // Rank calculation
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex((p) => p.spotifyId === currentPlayer.spotifyId) + 1;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6 text-center">
      {/* Result Splash Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6 flex flex-col items-center"
      >
        {isTarget ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
              <Music className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">
              It was YOUR song!
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Your music taste was put to the test.
            </p>
          </div>
        ) : isCorrect ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-emerald-400">
              Nailed It!
            </h2>
            <span className="text-xl font-black text-white mt-1">
              +{points.toLocaleString()} Points
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-400 mb-3 shadow-lg">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-rose-400">
              Wrong Guess!
            </h2>
            <span className="text-sm text-neutral-400 mt-1">
              Better luck next round!
            </span>
          </div>
        )}
      </motion.div>

      {/* Song & Owner Info Card */}
      <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl mb-6 text-left">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          The Song Owner
        </div>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-800">
          <img
            src={targetPlayer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetPlayer?.name}`}
            alt={targetPlayer?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/50"
          />
          <div>
            <div className="text-base font-bold text-white">
              {targetPlayer?.name}
            </div>
            <div className="text-xs text-emerald-400">
              Featured Top Spotify Track
            </div>
          </div>
        </div>

        {track && (
          <div className="flex items-center gap-3">
            {track.albumArt && (
              <img
                src={track.albumArt}
                alt={track.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            )}
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-white truncate">
                {track.name}
              </div>
              <div className="text-xs text-neutral-400 truncate">
                {track.artist}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personal Scoreboard Badge */}
      <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-white">Your Rank: #{rank}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-emerald-400 font-mono">
            {currentPlayer.score.toLocaleString()}
          </span>
          <span className="text-[10px] text-neutral-400 block uppercase">
            Total pts
          </span>
        </div>
      </div>

      {/* Waiting Indicator */}
      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400">
        <Clock className="w-4 h-4 animate-spin text-emerald-400" />
        <span>Waiting for host to start next round...</span>
      </div>
    </div>
  );
}
