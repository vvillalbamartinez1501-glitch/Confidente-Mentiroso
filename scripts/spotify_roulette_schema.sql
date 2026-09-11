-- Supabase Schema for Spotify Roulette
CREATE TABLE IF NOT EXISTS spotify_roulette_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(4) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'LOBBY',
  current_round INT NOT NULL DEFAULT 0,
  total_rounds INT NOT NULL DEFAULT 5,
  target_player_id TEXT,
  current_track JSONB,
  round_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spotify_roulette_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES spotify_roulette_rooms(id) ON DELETE CASCADE,
  spotify_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  score INT NOT NULL DEFAULT 0,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at BIGINT,
  top_tracks_cache JSONB,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_in_room UNIQUE (room_id, spotify_id)
);

CREATE TABLE IF NOT EXISTS spotify_roulette_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES spotify_roulette_rooms(id) ON DELETE CASCADE,
  round INT NOT NULL,
  voter_id TEXT NOT NULL,
  guessed_player_id TEXT NOT NULL,
  is_correct BOOLEAN,
  points_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE spotify_roulette_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE spotify_roulette_players;
ALTER PUBLICATION supabase_realtime ADD TABLE spotify_roulette_votes;
