import { SpotifyTrack } from './spotifyRouletteTypes';

export const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-top-read',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-private',
].join(' ');

interface SpotifyTokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export async function refreshSpotifyToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    return null;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh Spotify token:', errorText);
      return null;
    }

    const data = (await response.json()) as SpotifyTokenRefreshResponse;
    const expiresAt = Date.now() + data.expires_in * 1000;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // fallback to old refresh token if not returned
      expiresAt,
    };
  } catch (error) {
    console.error('Error in refreshSpotifyToken:', error);
    return null;
  }
}

export async function fetchUserTopTracks(accessToken: string): Promise<SpotifyTrack[]> {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Spotify top tracks request returned status ${response.status}`);
      // Fallback: try medium_term if short_term is empty or 403
      const fallbackResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!fallbackResponse.ok) return [];
      const fallbackData = await fallbackResponse.json();
      return parseTracks(fallbackData.items || []);
    }

    const data = await response.json();
    return parseTracks(data.items || []);
  } catch (error) {
    console.error('Error fetching user top tracks:', error);
    return [];
  }
}

function parseTracks(items: any[]): SpotifyTrack[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
    albumName: item.album?.name || '',
    albumArt: item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || '',
    uri: item.uri,
    previewUrl: item.preview_url || null,
    durationMs: item.duration_ms || 30000,
  }));
}

export async function playSpotifyTrackOnDevice(accessToken: string, deviceId: string, trackUri: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    return response.status === 204 || response.ok;
  } catch (err) {
    console.error('Error playing track on device:', err);
    return false;
  }
}
