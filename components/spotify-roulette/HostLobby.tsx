'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { RouletteRoom } from '@/lib/spotifyRouletteTypes';

interface HostLobbyProps {
  room: RouletteRoom;
  joinUrl: string;
  onStartGame: () => void;
  isStarting: boolean;
}

export function HostLobby({ room, joinUrl, onStartGame, isStarting }: HostLobbyProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 py-10">
      {/* Top Header */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        Spotify Roulette Lobby
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
        {/* Left Side: Room Code & QR Code Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-between text-center shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <h2 className="text-neutral-400 text-sm font-semibold uppercase tracking-widest mb-1">
              Join with Room Code
            </h2>
            <div className="text-6xl font-black tracking-widest text-emerald-400 font-mono bg-clip-text drop-shadow-md">
              {room.code}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Scan with phone camera or go to <span className="text-white font-mono">{joinUrl}</span>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="my-6 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <QRCodeSVG 
              value={joinUrl} 
              size={190}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Copy Direct Link'}
          </button>
        </motion.div>

        {/* Right Side: Players List & Start Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">
                  Players in Room ({room.players.length})
                </h3>
              </div>
              <span className="text-xs text-neutral-400">
                Spotify sync enabled
              </span>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[340px] overflow-y-auto pr-1">
              {room.players.map((player) => (
                <motion.div
                  key={player.spotifyId}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50 hover:border-emerald-500/40 transition-all"
                >
                  <img
                    src={player.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                    alt={player.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/50"
                  />
                  <div className="overflow-hidden text-left">
                    <div className="font-bold text-sm text-white truncate flex items-center gap-1">
                      {player.name}
                    </div>
                    {player.isHost && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase">
                        <ShieldCheck className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {room.players.length === 1 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center">
                Waiting for friends to join... (You can also start in solo test mode)
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              5 Rounds per match • 30s per guess
            </div>
            <button
              onClick={onStartGame}
              disabled={isStarting || room.players.length === 0}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-lg transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              {isStarting ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
