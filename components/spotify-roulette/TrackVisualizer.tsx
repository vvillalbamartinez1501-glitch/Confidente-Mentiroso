'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Disc3, Music2, Volume2 } from 'lucide-react';

interface TrackVisualizerProps {
  isPlaying: boolean;
  isMasked?: boolean;
  albumArt?: string;
  fallbackMode?: boolean;
}

export function TrackVisualizer({
  isPlaying,
  isMasked = true,
  albumArt,
  fallbackMode = false,
}: TrackVisualizerProps) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6">
      {/* Outer ambient glow */}
      <div 
        className={`absolute w-72 h-72 rounded-full blur-3xl transition-all duration-1000 ${
          isPlaying ? 'bg-emerald-500/30 scale-110' : 'bg-blue-500/10 scale-90'
        }`}
      />

      {/* Vinyl record disc */}
      <motion.div
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
        className="relative w-56 h-56 rounded-full bg-neutral-900 border-4 border-neutral-800 shadow-2xl flex items-center justify-center p-3"
        style={{
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.25), inset 0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {/* Vinyl grooves */}
        <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />

        {/* Center label */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-neutral-800 flex items-center justify-center">
          {isMasked ? (
            <div className="flex flex-col items-center justify-center text-center p-2 bg-gradient-to-br from-neutral-800 to-neutral-900 w-full h-full">
              <Disc3 className="w-8 h-8 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[9px] uppercase tracking-widest text-emerald-400/80 font-bold mt-1">SECRET</span>
            </div>
          ) : albumArt ? (
            <img src={albumArt} alt="Album Art" className="w-full h-full object-cover" />
          ) : (
            <Music2 className="w-8 h-8 text-emerald-400" />
          )}
          {/* Spindle hole */}
          <div className="absolute w-4 h-4 rounded-full bg-black border border-white/20" />
        </div>
      </motion.div>

      {/* Playback indicator */}
      <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
        <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
        <span className="text-xs font-semibold text-neutral-300">
          {isPlaying 
            ? (fallbackMode ? 'Streaming 30s Audio Preview' : 'Spotify Web Playback SDK Active')
            : 'Audio Paused'}
        </span>
      </div>
    </div>
  );
}
