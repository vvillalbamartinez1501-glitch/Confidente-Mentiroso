'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogIn, AlertCircle, Music } from 'lucide-react';
import { useSupabaseRoom } from '@/hooks/useSupabaseRoom';
import { PlayerLobby } from '@/components/spotify-roulette/PlayerLobby';
import { PlayerVoting } from '@/components/spotify-roulette/PlayerVoting';
import { PlayerResult } from '@/components/spotify-roulette/PlayerResult';

interface PlayerRoomPageProps {
  params: Promise<{ roomCode: string }>;
}

export default function PlayerRoomPage({ params }: PlayerRoomPageProps) {
  const resolvedParams = use(params);
  const roomCode = (resolvedParams.roomCode || '').toUpperCase();
  const router = useRouter();

  const { data: session, status } = useSession();
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const { room, loading, error, currentPlayer, refetch } = useSupabaseRoom({
    roomCode,
    isHost: false,
    currentPlayerId: session?.user?.id,
  });

  // Automatically join the room once authenticated
  const joinRoom = useCallback(async () => {
    if (!roomCode || !session?.user) return;
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          spotifyId: session.user.id,
          name: session.user.name,
          avatarUrl: session.user.image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasJoined(true);
        refetch();
      } else {
        setJoinError(data.error || 'Failed to join room');
      }
    } catch (err: any) {
      setJoinError(err.message || 'Error joining room');
    }
  }, [roomCode, session, refetch]);

  useEffect(() => {
    if (status === 'authenticated' && !hasJoined) {
      joinRoom();
    }
  }, [status, hasJoined, joinRoom]);

  // Handle vote submission
  const handleVote = async (guessedPlayerId: string) => {
    if (!session?.user?.id) return;
    setIsSubmittingVote(true);
    try {
      const res = await fetch('/api/rooms/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: roomCode,
          voterId: session.user.id,
          guessedPlayerId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        refetch();
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  // Auth gate: If not authenticated, prompt Spotify login
  if (status === 'unauthenticated') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white px-6 text-center">
        <div className="w-full max-w-sm bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] mb-6">
            <Music className="w-8 h-8 animate-bounce" />
          </div>

          <h1 className="text-2xl font-black text-white mb-2">
            Join Room {roomCode}
          </h1>
          <p className="text-xs text-neutral-400 mb-6">
            To play Spotify Roulette, we need to connect with your Spotify account so the game can include your top tracks!
          </p>

          <button
            onClick={() => signIn('spotify', { callbackUrl: `/join/${roomCode}` })}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black text-base shadow-lg hover:shadow-[#1DB954]/30 transition-all active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            Connect Spotify & Join
          </button>
        </div>
      </main>
    );
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-xs font-semibold text-neutral-400">Connecting to room...</p>
      </div>
    );
  }

  if (error || joinError || !room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] text-white px-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Could Not Join Room</h2>
        <p className="text-neutral-400 text-xs mb-6 max-w-xs">
          {error || joinError || 'Room not found or expired.'}
        </p>
        <button
          onClick={() => router.push('/join')}
          className="px-6 py-3 rounded-2xl bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 transition-all border border-neutral-700"
        >
          Try Another Code
        </button>
      </div>
    );
  }

  const activePlayer = currentPlayer || {
    id: session?.user?.id || 'player',
    spotifyId: session?.user?.id || 'player',
    name: session?.user?.name || 'Player',
    avatarUrl: session?.user?.image || '',
    score: 0,
    isHost: false,
    joinedAt: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-[#0a0c10] text-white flex flex-col justify-between select-none">
      {/* Top Mobile Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-20">
        <span className="font-mono font-black text-xs text-emerald-400 tracking-wider">
          ROOM: {room.code}
        </span>
        <div className="flex items-center gap-2">
          <img
            src={activePlayer.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePlayer.name}`}
            alt={activePlayer.name}
            className="w-7 h-7 rounded-full border border-emerald-400/50"
          />
          <span className="text-xs font-bold text-white max-w-[100px] truncate">
            {activePlayer.name}
          </span>
        </div>
      </header>

      {/* Main Screen Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {room.status === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <PlayerLobby room={room} player={activePlayer} />
            </motion.div>
          )}

          {room.status === 'FETCHING' && (
            <motion.div
              key="fetching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center p-6"
            >
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
              <h3 className="text-xl font-black text-white">
                Host is spinning the wheel...
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                A secret track is about to play on the host screen!
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
              <PlayerVoting
                room={room}
                currentPlayer={activePlayer}
                onVote={handleVote}
                isSubmitting={isSubmittingVote}
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
              <PlayerResult room={room} currentPlayer={activePlayer} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="w-full py-3 text-center text-[10px] text-neutral-600 border-t border-neutral-900">
        Spotify Roulette Controller
      </footer>
    </main>
  );
}
