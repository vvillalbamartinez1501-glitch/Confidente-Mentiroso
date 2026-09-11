'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, HelpCircle, CheckCircle2, FastForward } from 'lucide-react';
import { RouletteRoom } from '@/lib/spotifyRouletteTypes';
import { TrackVisualizer } from './TrackVisualizer';

interface HostStageProps {
  room: RouletteRoom;
  isPlaying: boolean;
  fallbackMode: boolean;
  onTimeUp: () => void;
}

export function HostStage({ room, isPlaying, fallbackMode, onTimeUp }: HostStageProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!room.roundEndsAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.roundEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [room.roundEndsAt, onTimeUp]);

  const votedCount = Object.keys(room.votes || {}).length;
  const totalPlayers = room.players.length;
  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 py-8">
      {/* Top Banner & Round Indicator */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            Round {room.currentRound} of {room.totalRounds}
          </span>
          <span className="text-neutral-400 text-sm font-semibold">
            Listening Phase
          </span>
        </div>

        {/* 30s Timer Display */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg">
          <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-500 animate-bounce' : 'text-emerald-400'}`} />
          <span className={`text-2xl font-black font-mono ${timeLeft <= 5 ? 'text-rose-500' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Stage Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        {/* Progress Bar at the top of the card */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-neutral-800">
          <motion.div 
            className={`h-full ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-400'}`}
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-black text-white text-center mt-2 mb-1 tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-emerald-400" />
          Whose Top Spotify Track Is This?
        </h2>
        <p className="text-neutral-400 text-sm text-center mb-6">
          Listen to the song on this screen and lock in your vote on your phone!
        </p>

        {/* Vinyl Visualizer */}
        <TrackVisualizer 
          isPlaying={isPlaying} 
          isMasked={true} 
          fallbackMode={fallbackMode}
        />

        {/* Voting Progress Tracker */}
        <div className="w-full max-w-2xl mt-6 pt-6 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-neutral-300">
              Votes Received: {votedCount} / {totalPlayers}
            </span>
            <button
              onClick={onTimeUp}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" /> Skip to Reveal
            </button>
          </div>

          {/* Players Vote Status Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {room.players.map((player) => {
              const hasVoted = !!room.votes?.[player.spotifyId];
              return (
                <div
                  key={player.spotifyId}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    hasVoted 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                      : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-400'
                  }`}
                >
                  <img
                    src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                    alt={player.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{player.name}</span>
                  {hasVoted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
