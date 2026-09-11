'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Music2 } from 'lucide-react';
import { RouletteRoom, RoulettePlayer } from '@/lib/spotifyRouletteTypes';

interface PlayerVotingProps {
  room: RouletteRoom;
  currentPlayer: RoulettePlayer;
  onVote: (guessedPlayerId: string) => void;
  isSubmitting: boolean;
}

export function PlayerVoting({
  room,
  currentPlayer,
  onVote,
  isSubmitting,
}: PlayerVotingProps) {
  const existingVote = room.votes?.[currentPlayer.spotifyId];
  const [selectedId, setSelectedId] = useState<string | null>(existingVote?.guessedPlayerId || null);

  const handleSelect = (playerId: string) => {
    if (selectedId || isSubmitting) return;
    setSelectedId(playerId);

    // Haptic feedback for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    onVote(playerId);
  };

  const hasVoted = !!selectedId || !!existingVote;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-6">
      {/* Round & Prompt Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-2">
          Round {room.currentRound} • Cast Your Vote
        </span>
        <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
          <Music2 className="w-6 h-6 text-emerald-400 animate-pulse" />
          Who listents to this?
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Listen to the song playing on the Host&apos;s screen and tap your guess!
        </p>
      </div>

      {/* Voting Target Cards */}
      <div className="grid grid-cols-1 gap-3 w-full mb-6">
        {room.players.map((player) => {
          const isSelected = selectedId === player.spotifyId;
          const isSelf = player.spotifyId === currentPlayer.spotifyId;

          return (
            <motion.button
              key={player.spotifyId}
              whileTap={{ scale: hasVoted ? 1 : 0.97 }}
              disabled={hasVoted || isSubmitting}
              onClick={() => handleSelect(player.spotifyId)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : hasVoted
                  ? 'bg-neutral-900/60 border-neutral-800 opacity-60'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-emerald-500/50 active:bg-emerald-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/40"
                />
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    {player.name}
                    {isSelf && (
                      <span className="text-[10px] text-neutral-400 font-normal bg-neutral-800 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {isSelf ? 'Is this secretly your top track?' : 'Could this be their track?'}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Vote Locked Confirmation */}
      {hasVoted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold shadow-lg text-center"
        >
          <Lock className="w-4 h-4" />
          Vote Locked In! Look at the Host screen.
        </motion.div>
      )}
    </div>
  );
}
