'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Disc3 } from 'lucide-react';
import { sanitizeRoomCode } from '@/lib/roomCode';

export default function ManualJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeRoomCode(code);
    if (sanitized.length !== 4) {
      setError('Room code must be 4 letters');
      return;
    }
    router.push(`/join/${sanitized}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white px-4">
      {/* Background Accent */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl backdrop-blur-xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 mb-6 shadow-lg">
          <Disc3 className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-1">
          Join Spotify Roulette
        </h1>
        <p className="text-xs text-neutral-400 text-center mb-6">
          Enter the 4-character code shown on the Host screen
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="CODE"
              className="w-full py-4 text-center text-4xl font-mono font-black tracking-widest bg-black/50 border-2 border-neutral-700 focus:border-emerald-400 rounded-2xl text-emerald-400 outline-none uppercase transition-all"
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-400 text-center mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={code.trim().length !== 4}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-base shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            <span>Enter Room</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </main>
  );
}
