import { useState, useEffect, useCallback } from 'react';
import { supabase, ROOMS_TABLE, PLAYERS_TABLE } from '../lib/supabase';
import { Player, Session, GameState } from '../lib/types';

export function useOnlineManager() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate a random 4-5 character code
  const generateCode = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Subscribe to players in the room
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: PLAYERS_TABLE, filter: `room_id=eq.${roomId}` },
        async () => {
          const { data } = await supabase
            .from(PLAYERS_TABLE)
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });
          
          if (data) {
            setOnlinePlayers(data.map(p => ({
              id: p.id,
              name: p.name,
              score: p.score,
              hp: p.hp,
              isEliminated: false,
              isHost: p.is_host,
              status: p.status
            })));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: ROOMS_TABLE, filter: `id=eq.${roomId}` },
        (payload: any) => {
          setGameState(payload.new.game_state);
          if (payload.new.status === 'finished') {
            setError('La partida ha finalizado.');
            setRoomCode(null);
          }
        }
      )
      .subscribe();

    // Initial fetch
    const fetchInitial = async () => {
      const { data: players } = await supabase.from(PLAYERS_TABLE).select('*').eq('room_id', roomId);
      if (players) setOnlinePlayers(players.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        hp: p.hp,
        isEliminated: false,
        isHost: p.is_host,
        status: p.status
      })));

      const { data: room } = await supabase.from(ROOMS_TABLE).select('game_state').eq('id', roomId).single();
      if (room) setGameState(room.game_state);
    };
    fetchInitial();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Handle cleanup on unmount/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && playerId) {
        leaveRoom(roomId, playerId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, playerId, isHost]);

  const createRoom = async (hostName: string) => {
    const code = generateCode();
    const hId = crypto.randomUUID();

    const { data, error } = await supabase
      .from(ROOMS_TABLE)
      .insert([
        { 
          code, 
          host_id: hId, 
          status: 'waiting',
          game_state: { phase: 'lobby' }
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      setError('No se pudo crear la sala.');
      return null;
    }

    await supabase.from(PLAYERS_TABLE).insert([
      {
        room_id: data.id,
        id: hId,
        name: hostName,
        is_host: true,
        score: 0,
        hp: 5,
        status: 'online'
      }
    ]);

    setRoomCode(code);
    setRoomId(data.id);
    setPlayerId(hId);
    setIsHost(true);
    return { code, roomId: data.id, hostId: hId };
  };

  const joinRoom = async (code: string, playerName: string) => {
    const { data: room, error: roomError } = await supabase
      .from(ROOMS_TABLE)
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'waiting')
      .single();

    if (roomError || !room) {
      setError('Sala no encontrada o ya en juego.');
      return null;
    }

    const pId = crypto.randomUUID();
    const { error: playerError } = await supabase.from(PLAYERS_TABLE).insert([
      {
        room_id: room.id,
        id: pId,
        name: playerName,
        is_host: false,
        score: 0,
        hp: 5,
        status: 'online'
      }
    ]);

    if (playerError) {
      setError('No se pudo unir a la sala.');
      return null;
    }

    setRoomCode(code);
    setRoomId(room.id);
    setPlayerId(pId);
    setIsHost(false);
    return { roomId: room.id, playerId: pId };
  };


  const kickPlayer = async (targetPlayerId: string) => {
    if (!isHost || !roomId) return;
    await supabase
      .from(PLAYERS_TABLE)
      .delete()
      .eq('room_id', roomId)
      .eq('id', targetPlayerId);
  };

  const updateGameState = async (newState: any) => {
    if (!isHost || !roomId) return;
    await supabase
      .from(ROOMS_TABLE)
      .update({ game_state: newState })
      .eq('id', roomId);
  };

  const leaveRoom = async () => {
    if (!roomId || !playerId) return;
    if (isHost) {
      await supabase.from(ROOMS_TABLE).update({ status: 'finished' }).eq('id', roomId);
    } else {
      await supabase.from(PLAYERS_TABLE).delete().eq('id', playerId);
    }
    setRoomCode(null);
    setRoomId(null);
    setPlayerId(null);
    setIsHost(false);
    setOnlinePlayers([]);
  };

  return {
    roomCode,
    isHost,
    onlinePlayers,
    gameState,
    error,
    playerId,
    createRoom,
    joinRoom,
    kickPlayer,
    updateGameState,
    leaveRoom,
    setOnlinePlayers,
    setGameState,
    setError
  };
}
