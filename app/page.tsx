'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LogIn, LogOut, CheckCircle2, Music, 
  Key, ShieldCheck, User, Sparkles, Play, ArrowRight, Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const tokenSnippet = session?.accessToken 
    ? `${session.accessToken.slice(0, 14)}...${session.accessToken.slice(-8)}`
    : 'No access token available';

  return (
    <main className="relative flex flex-col items-center justify-between min-h-screen bg-[#0a0c10] text-white overflow-hidden px-6 py-10">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1DB954]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Badge */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 mb-6 backdrop-blur-xl"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
            Spotify Roulette • Auth Engine
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-5xl sm:text-7xl font-black mb-4 tracking-tighter uppercase leading-[0.95]">
            Spotify <span className="text-emerald-400">Roulette</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg font-medium max-w-md mx-auto leading-relaxed mb-8">
            Guess whose top Spotify track is playing in real-time. Test your Spotify OAuth integration below.
          </p>
        </motion.div>

        {/* Phase 1: Spotify Authentication Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-10 text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Spotify Authentication
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span className="text-[11px] text-neutral-300">
                {isLoading ? 'Checking...' : isAuthenticated ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] mb-4">
                <LogIn className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Connect your Spotify Account
              </h3>
              <p className="text-xs text-neutral-400 mb-6 max-w-sm">
                NextAuth will authenticate with Spotify and grant the required permissions to stream music and read your top tracks.
              </p>

              <button
                onClick={() => signIn('spotify')}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-base shadow-xl shadow-[#1DB954]/25 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                <span>Login with Spotify</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Profile Overview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User Avatar'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 border-2 border-emerald-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white truncate">
                      {session?.user?.name || 'Spotify User'}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-neutral-400 truncate">
                    {session?.user?.email || 'Spotify Account'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest">
                    ID: {session?.user?.id || 'Connected'}
                  </span>
                </div>
              </div>

              {/* Access Token Snippet for Verification */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    Captured Access Token:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    persisted in JWT & Session
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 font-mono text-xs text-neutral-300 break-all select-all">
                  {tokenSnippet}
                </div>
              </div>

              {/* Scopes Verified Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  OAuth Scopes configured: <code className="text-white font-mono text-[10px]">user-read-email, user-top-read, streaming, playback-state</code>
                </span>
              </div>

              {/* Navigation & Logout Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Link
                  href="/host"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Go to Host Screen</span>
                </Link>

                <button
                  onClick={() => signOut()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all border border-neutral-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-neutral-400">
          <Link href="/join" className="hover:text-white transition-colors underline underline-offset-4">
            Join a Room
          </Link>
          <span>•</span>
          <Link href="/hub" className="hover:text-white transition-colors underline underline-offset-4">
            Party Games Hub
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
