'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Play, Sparkles, LogIn, Disc3, ShieldCheck } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';

export default function HostLandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: session?.user?.name || 'Host',
          avatarUrl: session?.user?.image,
        }),
      });
      const data = await res.json();
      if (data.success && data.roomCode) {
        router.push(`/host/${data.roomCode}`);
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating game room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSpotifyLogin = () => {
    signIn('spotify', { callbackUrl: '/host' });
  };

  const isAuthenticated = status === 'authenticated';

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white overflow-hidden px-6">
      {/* Background Neon Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center max-w-xl text-center"
      >
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4" />
          Jackbox-Style Music Party
        </div>

        {/* Icon & Title */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
            <Disc3 className="w-12 h-12 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Spotify <span className="text-emerald-400">Roulette</span>
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg mb-8 max-w-md">
          Stream mystery top tracks on this big screen. Your friends join on their phones and race to guess who listens to what!
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleSpotifyLogin}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-lg shadow-xl shadow-[#1DB954]/20 hover:scale-105 transition-all w-full sm:w-auto"
            >
              <LogIn className="w-5 h-5" />
              Log in with Spotify to Host
            </button>
            <p className="text-xs text-neutral-400 max-w-xs">
              Requires Spotify account to play music via Web Playback SDK & fetch top tracks.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Logged in as <strong className="text-white">{session?.user?.name || 'Spotify Host'}</strong>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-lg shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all disabled:opacity-50 w-full sm:w-auto"
            >
              <Play className="w-5 h-5 fill-current" />
              {isCreating ? 'Creating Room...' : 'Host Game Now'}
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
