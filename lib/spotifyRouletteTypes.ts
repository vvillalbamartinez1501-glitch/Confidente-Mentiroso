export type RouletteGameStatus = 
  | 'LOBBY' 
  | 'FETCHING' 
  | 'PLAYING' 
  | 'REVEAL' 
  | 'FINISHED';

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  albumName: string;
  albumArt: string;
  uri: string;
  previewUrl: string | null;
  durationMs: number;
}

export interface RoulettePlayer {
  id: string; // Internal or Spotify user ID
  spotifyId: string;
  name: string;
  avatarUrl: string;
  score: number;
  isHost: boolean;
  joinedAt: string;
  hasVoted?: boolean;
}

export interface RouletteVote {
  voterId: string;
  guessedPlayerId: string;
  round: number;
  timestamp: number;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface RouletteRoom {
  id: string;
  code: string;
  hostId: string;
  status: RouletteGameStatus;
  currentRound: number;
  totalRounds: number;
  currentTrack: SpotifyTrack | null;
  targetPlayerId: string | null;
  targetPlayerName?: string | null;
  roundEndsAt: number | null; // epoch timestamp
  players: RoulettePlayer[];
  votes: Record<string, RouletteVote>; // voterId -> RouletteVote
  createdAt: string;
  history?: Array<{
    round: number;
    track: SpotifyTrack;
    targetPlayerId: string;
    votes: Record<string, RouletteVote>;
  }>;
}

export interface JoinRoomResponse {
  success: boolean;
  room?: RouletteRoom;
  player?: RoulettePlayer;
  error?: string;
}
