'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, Music, Check, X, Sparkles, Crown } from 'lucide-react';
import { RouletteRoom } from '@/lib/spotifyRouletteTypes';

interface HostRevealProps {
  room: RouletteRoom;
  onNextRound: () => void;
  isNextLoading: boolean;
}

export function HostReveal({ room, onNextRound, isNextLoading }: HostRevealProps) {
  useEffect(() => {
    // Trigger celebratory confetti on reveal
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const targetPlayer = room.players.find(p => p.spotifyId === room.targetPlayerId);
  const track = room.currentTrack;
  const isFinished = room.status === 'FINISHED' || room.currentRound >= room.totalRounds;

  // Sort players by highest score
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 py-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between w-full mb-6">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          {isFinished ? 'Game Over • Final Results' : `Round ${room.currentRound} Results`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Left Side: The Big Reveal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="lg:col-span-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3">
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Secret Revealed
            </span>
          </div>

          <span className="text-neutral-400 text-xs uppercase font-bold tracking-widest mb-4">
            This Song Belonged To
          </span>

          {/* Target Player Profile */}
          <div className="relative mb-6">
            <img
              src={targetPlayer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetPlayer?.name}`}
              alt={targetPlayer?.name || 'Target Player'}
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-400 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg">
              <Crown className="w-5 h-5 fill-current" />
            </div>
          </div>

          <h3 className="text-3xl font-black text-white mb-6">
            {targetPlayer?.name || 'Unknown Player'}
          </h3>

          {/* Revealed Song Card */}
          {track && (
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 text-left">
              {track.albumArt ? (
                <img
                  src={track.albumArt}
                  alt={track.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center">
                  <Music className="w-8 h-8 text-emerald-400" />
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-lg font-bold text-white truncate">
                  {track.name}
                </div>
                <div className="text-sm text-emerald-400 truncate">
                  {track.artist}
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {track.albumName}
                </div>
              </div>
            </div>
          )}

          {/* Votes breakdown list */}
          <div className="w-full mt-6 text-left border-t border-neutral-800 pt-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Who Guessed Correctly?
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {room.players.map(p => {
                const vote = room.votes?.[p.spotifyId];
                const isCorrect = vote?.isCorrect;
                return (
                  <div 
                    key={p.spotifyId}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-neutral-800/40"
                  >
                    <span className="text-neutral-300 font-medium">{p.name}</span>
                    <span className="flex items-center gap-1 font-bold">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> +{vote?.pointsAwarded || 1000} pts
                        </span>
                      ) : (
                        <span className="text-neutral-500 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Missed
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Scoreboard & Next Round Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-white">
                  Leaderboard
                </h3>
              </div>
              <span className="text-xs text-neutral-400">
                Sorted by total points
              </span>
            </div>

            {/* Scoreboard List */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {sortedPlayers.map((player, index) => {
                const isFirst = index === 0;
                return (
                  <motion.div
                    key={player.spotifyId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isFirst 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : 'bg-neutral-800/50 border-neutral-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-black text-sm ${isFirst ? 'text-amber-400' : 'text-neutral-400'}`}>
                        #{index + 1}
                      </span>
                      <img
                        src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-bold text-sm text-white">
                        {player.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {player.score.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-neutral-400 block uppercase">
                        points
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-neutral-800">
            <button
              onClick={onNextRound}
              disabled={isNextLoading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-lg transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
            >
              <span>{isFinished ? 'Play Another Game' : 'Next Round'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
