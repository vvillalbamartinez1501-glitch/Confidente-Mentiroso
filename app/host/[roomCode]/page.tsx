'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Music4, AlertCircle } from 'lucide-react';
import { useSupabaseRoom } from '@/hooks/useSupabaseRoom';
import { useSpotifyPlayback } from '@/hooks/useSpotifyPlayback';
import { HostLobby } from '@/components/spotify-roulette/HostLobby';
import { HostStage } from '@/components/spotify-roulette/HostStage';
import { HostReveal } from '@/components/spotify-roulette/HostReveal';

interface HostRoomPageProps {
  params: Promise<{ roomCode: string }>;
}

export default function HostRoomPage({ params }: HostRoomPageProps) {
  const resolvedParams = use(params);
  const roomCode = (resolvedParams.roomCode || '').toUpperCase();
  const router = useRouter();

  const { data: session } = useSession();
  const [isStarting, setIsStarting] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');

  const { room, loading, error, refetch } = useSupabaseRoom({
    roomCode,
    isHost: true,
    currentPlayerId: session?.user?.id,
  });

  const {
    isReady,
    isPlaying,
    fallbackMode,
    playTrack,
    pauseTrack,
  } = useSpotifyPlayback({
    accessToken: session?.accessToken,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join/${roomCode}`);
    }
  }, [roomCode]);

  // When room transitions to PLAYING, start playing currentTrack
  useEffect(() => {
    if (room?.status === 'PLAYING' && room.currentTrack) {
      playTrack(room.currentTrack);
    } else if (room?.status === 'REVEAL' || room?.status === 'FINISHED') {
      pauseTrack();
    }
  }, [room?.status, room?.currentTrack, playTrack, pauseTrack]);

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        refetch();
      }
    } catch (err) {
      console.error('Error starting game:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleTimeUp = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        refetch();
      }
    } catch (err) {
      console.error('Error revealing results:', err);
    }
  }, [roomCode, refetch]);

  const handleNextRound = async () => {
    setIsNextLoading(true);
    try {
      if (room?.status === 'FINISHED') {
        // Reset room or return to lobby
        router.push('/host');
        return;
      }

      const res = await fetch('/api/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        refetch();
      }
    } catch (err) {
      console.error('Error advancing to next round:', err);
    } finally {
      setIsNextLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
        <p className="text-sm font-semibold text-neutral-400">Loading Room {roomCode}...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white px-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
        <p className="text-neutral-400 text-sm mb-6 max-w-sm">
          {error || 'This game room does not exist or has expired.'}
        </p>
        <button
          onClick={() => router.push('/host')}
          className="px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all"
        >
          Create New Room
        </button>
      </div>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-between min-h-screen bg-[#0a0c10] text-white overflow-hidden select-none">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Music4 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-sm uppercase tracking-wider text-white">
              Spotify Roulette
            </span>
            <span className="text-[10px] text-neutral-400 block font-mono">
              ROOM: {room.code}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[11px] font-semibold">
              {isReady ? 'SDK Connected' : (fallbackMode ? 'Preview Audio Mode' : 'Connecting Audio')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 py-4">
        <AnimatePresence mode="wait">
          {room.status === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <HostLobby
                room={room}
                joinUrl={joinUrl}
                onStartGame={handleStartGame}
                isStarting={isStarting}
              />
            </motion.div>
          )}

          {room.status === 'FETCHING' && (
            <motion.div
              key="fetching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center p-8 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-2xl backdrop-blur-xl max-w-lg mx-auto"
            >
              <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">
                Selecting Mystery Track...
              </h3>
              <p className="text-sm text-neutral-400">
                Checking players&apos; Spotify top tracks and tuning the record player.
              </p>
            </motion.div>
          )}

          {room.status === 'PLAYING' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <HostStage
                room={room}
                isPlaying={isPlaying}
                fallbackMode={fallbackMode}
                onTimeUp={handleTimeUp}
              />
            </motion.div>
          )}

          {(room.status === 'REVEAL' || room.status === 'FINISHED') && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <HostReveal
                room={room}
                onNextRound={handleNextRound}
                isNextLoading={isNextLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-neutral-500 z-10">
        Spotify Roulette • Host Console
      </footer>
    </main>
  );
}
