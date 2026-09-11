'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RouletteRoom, RoulettePlayer } from '@/lib/spotifyRouletteTypes';

interface UseSupabaseRoomOptions {
  roomCode: string;
  isHost?: boolean;
  currentPlayerId?: string;
  initialRoom?: RouletteRoom | null;
}

export function useSupabaseRoom({
  roomCode,
  isHost = false,
  currentPlayerId,
  initialRoom = null,
}: UseSupabaseRoomOptions) {
  const [room, setRoom] = useState<RouletteRoom | null>(initialRoom);
  const [loading, setLoading] = useState(!initialRoom);
  const [error, setError] = useState<string | null>(null);
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;

  const fetchRoom = useCallback(async () => {
    if (!roomCode) return;
    try {
      const res = await fetch(`/api/rooms/${roomCode}?isHost=${isHostRef.current}`);
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);
        setError(null);
      } else if (!room) {
        setError(data.error || 'Room not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch room state:', err);
    } finally {
      setLoading(false);
    }
  }, [roomCode, room]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Subscribe to Supabase Realtime broadcast channel
  useEffect(() => {
    if (!roomCode) return;

    const channelName = `roulette-room:${roomCode.toUpperCase()}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
      },
    });

    channel
      .on('broadcast', { event: 'ROOM_UPDATE' }, ({ payload }) => {
        if (payload) {
          setRoom((prev) => {
            // Merge or update
            return {
              ...payload,
              // Keep target player if host
              targetPlayerId: isHostRef.current ? payload.targetPlayerId : (payload.status === 'REVEAL' ? payload.targetPlayerId : null),
              targetPlayerName: isHostRef.current ? payload.targetPlayerName : (payload.status === 'REVEAL' ? payload.targetPlayerName : null),
            };
          });
        }
      })
      .subscribe();

    // Heartbeat fallback polling every 3 seconds to guarantee sync
    const interval = setInterval(fetchRoom, 3000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [roomCode, fetchRoom]);

  const currentPlayer = room?.players.find((p) => p.spotifyId === currentPlayerId);

  return {
    room,
    loading,
    error,
    currentPlayer,
    refetch: fetchRoom,
  };
}
