import { generateRoomCode } from './roomCode';
import { 
  RouletteRoom, 
  RoulettePlayer, 
  RouletteVote, 
  SpotifyTrack 
} from './spotifyRouletteTypes';
import { fetchUserTopTracks, refreshSpotifyToken } from './spotify';
import { supabase } from './supabase';

interface StoredPlayerToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Global server memory store to ensure fast state transitions & resilience
declare global {
  // eslint-disable-next-line no-var
  var __ROULETTE_ROOMS__: Map<string, RouletteRoom> | undefined;
  // eslint-disable-next-line no-var
  var __PLAYER_TOKENS__: Map<string, StoredPlayerToken> | undefined; // key: `${roomCode}:${spotifyId}`
  // eslint-disable-next-line no-var
  var __PLAYER_TRACKS_CACHE__: Map<string, SpotifyTrack[]> | undefined; // key: `${roomCode}:${spotifyId}`
}

if (!global.__ROULETTE_ROOMS__) {
  global.__ROULETTE_ROOMS__ = new Map<string, RouletteRoom>();
}
if (!global.__PLAYER_TOKENS__) {
  global.__PLAYER_TOKENS__ = new Map<string, StoredPlayerToken>();
}
if (!global.__PLAYER_TRACKS_CACHE__) {
  global.__PLAYER_TRACKS_CACHE__ = new Map<string, SpotifyTrack[]>();
}

const rooms = global.__ROULETTE_ROOMS__;
const playerTokens = global.__PLAYER_TOKENS__;
const playerTracksCache = global.__PLAYER_TRACKS_CACHE__;

/**
 * Broadcast room state changes across Supabase Realtime channel
 */
export async function broadcastRoomUpdate(room: RouletteRoom) {
  try {
    const channel = supabase.channel(`roulette-room:${room.code}`);
    await channel.send({
      type: 'broadcast',
      event: 'ROOM_UPDATE',
      payload: sanitizeRoomForClient(room),
    });
  } catch (err) {
    console.warn(`Could not broadcast to Supabase channel for room ${room.code}:`, err);
  }
}

/**
 * Strips secret information (e.g. targetPlayerId during PLAYING phase) for clients
 */
export function sanitizeRoomForClient(room: RouletteRoom, isHost = false): RouletteRoom {
  const sanitized: RouletteRoom = {
    ...room,
    players: room.players.map(p => ({
      ...p,
      hasVoted: !!room.votes[p.spotifyId],
    })),
  };

  // During PLAYING, keep target player secret from non-host players
  // Even from host, keep it mystery until reveal if desired, but host needs track preview/uri
  if (sanitized.status === 'PLAYING' && !isHost) {
    sanitized.targetPlayerId = null;
    sanitized.targetPlayerName = null;
  }

  return sanitized;
}

export function getRoom(code: string): RouletteRoom | null {
  const normalized = (code || '').trim().toUpperCase();
  return rooms.get(normalized) || null;
}

export function savePlayerToken(roomCode: string, spotifyId: string, token: StoredPlayerToken) {
  playerTokens.set(`${roomCode}:${spotifyId}`, token);
}

export async function getValidPlayerToken(roomCode: string, spotifyId: string): Promise<string | null> {
  const key = `${roomCode}:${spotifyId}`;
  const token = playerTokens.get(key);
  if (!token) return null;

  if (Date.now() < token.expiresAt - 60000) {
    return token.accessToken;
  }

  if (token.refreshToken) {
    const refreshed = await refreshSpotifyToken(token.refreshToken);
    if (refreshed) {
      playerTokens.set(key, {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
      });
      return refreshed.accessToken;
    }
  }

  return token.accessToken;
}

export function createRoom(hostId: string, hostPlayer: Omit<RoulettePlayer, 'score' | 'isHost' | 'joinedAt'>): RouletteRoom {
  let code = generateRoomCode(4);
  while (rooms.has(code)) {
    code = generateRoomCode(4);
  }

  const room: RouletteRoom = {
    id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code,
    hostId,
    status: 'LOBBY',
    currentRound: 0,
    totalRounds: 5,
    currentTrack: null,
    targetPlayerId: null,
    targetPlayerName: null,
    roundEndsAt: null,
    players: [
      {
        ...hostPlayer,
        score: 0,
        isHost: true,
        joinedAt: new Date().toISOString(),
      },
    ],
    votes: {},
    createdAt: new Date().toISOString(),
    history: [],
  };

  rooms.set(code, room);
  broadcastRoomUpdate(room);
  return room;
}

export function addPlayerToRoom(code: string, player: Omit<RoulettePlayer, 'score' | 'isHost' | 'joinedAt'>): RoulettePlayer | null {
  const room = getRoom(code);
  if (!room) return null;

  const existing = room.players.find(p => p.spotifyId === player.spotifyId);
  if (existing) {
    existing.name = player.name;
    existing.avatarUrl = player.avatarUrl;
    broadcastRoomUpdate(room);
    return existing;
  }

  const newPlayer: RoulettePlayer = {
    ...player,
    score: 0,
    isHost: false,
    joinedAt: new Date().toISOString(),
  };

  room.players.push(newPlayer);
  broadcastRoomUpdate(room);
  return newPlayer;
}

export async function preloadAllPlayerTracks(room: RouletteRoom) {
  for (const p of room.players) {
    const key = `${room.code}:${p.spotifyId}`;
    if (!playerTracksCache.has(key)) {
      const token = await getValidPlayerToken(room.code, p.spotifyId);
      if (token) {
        const tracks = await fetchUserTopTracks(token);
        if (tracks && tracks.length > 0) {
          playerTracksCache.set(key, tracks);
        }
      }
    }
  }
}

export async function startRound(code: string): Promise<RouletteRoom | null> {
  const room = getRoom(code);
  if (!room || room.players.length === 0) return null;

  room.status = 'FETCHING';
  broadcastRoomUpdate(room);

  // 1. Preload tracks for all players
  await preloadAllPlayerTracks(room);

  // 2. Select eligible players who have tracks cached
  const playersWithTracks = room.players.filter(p => {
    const cached = playerTracksCache.get(`${room.code}:${p.spotifyId}`);
    return cached && cached.length > 0;
  });

  // Fallback track if no Spotify tracks could be fetched (e.g. new accounts or offline test)
  const fallbackTrack: SpotifyTrack = {
    id: 'test-track-1',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    albumName: 'After Hours',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80',
    uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
    previewUrl: 'https://p.scdn.co/mp3-preview/4839b070015ab7d1ba7f5d714e8f30619db828e3',
    durationMs: 30000,
  };

  let chosenPlayer: RoulettePlayer = room.players[Math.floor(Math.random() * room.players.length)];
  let chosenTrack: SpotifyTrack = fallbackTrack;

  if (playersWithTracks.length > 0) {
    chosenPlayer = playersWithTracks[Math.floor(Math.random() * playersWithTracks.length)];
    const tracks = playerTracksCache.get(`${room.code}:${chosenPlayer.spotifyId}`) || [];

    // Filter out tracks already played in history
    const playedUris = new Set((room.history || []).map(h => h.track.uri));
    const availableTracks = tracks.filter(t => !playedUris.has(t.uri));
    chosenTrack = availableTracks.length > 0 
      ? availableTracks[Math.floor(Math.random() * availableTracks.length)]
      : tracks[Math.floor(Math.random() * tracks.length)];
  }

  // Set Round state
  room.currentRound += 1;
  room.targetPlayerId = chosenPlayer.spotifyId;
  room.targetPlayerName = chosenPlayer.name;
  room.currentTrack = chosenTrack;
  room.votes = {};
  room.roundEndsAt = Date.now() + 30000; // 30 seconds
  room.status = 'PLAYING';

  broadcastRoomUpdate(room);
  return room;
}

export function submitVote(code: string, voterId: string, guessedPlayerId: string): { success: boolean; allVoted: boolean; room?: RouletteRoom } {
  const room = getRoom(code);
  if (!room || room.status !== 'PLAYING') {
    return { success: false, allVoted: false };
  }

  // Record vote
  room.votes[voterId] = {
    voterId,
    guessedPlayerId,
    round: room.currentRound,
    timestamp: Date.now(),
  };

  // Check if all players have voted
  const allVoted = room.players.length > 0 && room.players.every(p => !!room.votes[p.spotifyId]);

  broadcastRoomUpdate(room);
  return { success: true, allVoted, room };
}

export function revealRoundResults(code: string): RouletteRoom | null {
  const room = getRoom(code);
  if (!room || !room.currentTrack || !room.targetPlayerId) return null;

  const roundDuration = 30000;
  const roundStartTime = (room.roundEndsAt || Date.now()) - roundDuration;

  let correctGuessCount = 0;

  // Process votes and calculate scores
  Object.values(room.votes).forEach(vote => {
    const isCorrect = vote.guessedPlayerId === room.targetPlayerId;
    vote.isCorrect = isCorrect;

    if (isCorrect) {
      correctGuessCount++;
      // Time bonus: earlier votes get up to 300 extra points
      const elapsed = Math.max(0, vote.timestamp - roundStartTime);
      const timeBonus = Math.max(0, Math.floor((1 - elapsed / roundDuration) * 300));
      const points = 1000 + timeBonus;
      vote.pointsAwarded = points;

      const player = room.players.find(p => p.spotifyId === vote.voterId);
      if (player) {
        player.score += points;
      }
    } else {
      vote.pointsAwarded = 0;
    }
  });

  // Reward the target player if other people guessed their music or if they duped people!
  const targetPlayer = room.players.find(p => p.spotifyId === room.targetPlayerId);
  if (targetPlayer) {
    // Song owner gets 200 pts per correct guesser (recognition bonus)
    const ownerBonus = correctGuessCount * 200;
    targetPlayer.score += ownerBonus;
  }

  // Record history
  if (!room.history) room.history = [];
  room.history.push({
    round: room.currentRound,
    track: room.currentTrack,
    targetPlayerId: room.targetPlayerId,
    votes: { ...room.votes },
  });

  if (room.currentRound >= room.totalRounds) {
    room.status = 'FINISHED';
  } else {
    room.status = 'REVEAL';
  }

  broadcastRoomUpdate(room);
  return room;
}
