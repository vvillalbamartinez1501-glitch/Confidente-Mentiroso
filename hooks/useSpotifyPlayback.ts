'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { SpotifyTrack } from '@/lib/spotifyRouletteTypes';
import { playSpotifyTrackOnDevice } from '@/lib/spotify';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

interface UseSpotifyPlaybackProps {
  accessToken?: string | null;
}

export function useSpotifyPlayback({ accessToken }: UseSpotifyPlaybackProps) {
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<SpotifyTrack | null>(null);

  const playerRef = useRef<any>(null);
  const audioFallbackRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio element for fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioFallbackRef.current = new Audio();
      audioFallbackRef.current.onended = () => setIsPlaying(false);
      audioFallbackRef.current.onpause = () => setIsPlaying(false);
      audioFallbackRef.current.onplay = () => setIsPlaying(true);
    }
    return () => {
      if (audioFallbackRef.current) {
        audioFallbackRef.current.pause();
        audioFallbackRef.current.src = '';
      }
    };
  }, []);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) {
      setFallbackMode(true);
      return;
    }

    // Load SDK script if not already loaded
    if (!document.getElementById('spotify-player-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-player-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Spotify Roulette Game Host',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.8,
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify Web Playback SDK Ready with Device ID:', device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setFallbackMode(false);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.warn('Spotify SDK Initialization Error:', message);
        setFallbackMode(true);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.warn('Spotify SDK Authentication Error:', message);
        setFallbackMode(true);
      });

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.warn('Spotify SDK Account Error (likely non-Premium):', message);
        setFallbackMode(true);
      });

      player.addListener('player_state_changed', (state: any) => {
        if (state) {
          setIsPlaying(!state.paused);
        }
      });

      player.connect().then((success: boolean) => {
        if (!success) {
          console.warn('Failed to connect Spotify Player SDK, enabling fallback mode');
          setFallbackMode(true);
        }
      });

      playerRef.current = player;
    };

    // Timeout safety: if SDK doesn't initialize within 5s, fallback to audio preview
    const timeout = setTimeout(() => {
      if (!isReady) {
        setFallbackMode(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [accessToken, isReady]);

  // Web Audio synth chime if track has no preview_url and SDK is in fallback mode
  const playSynthesizerGroove = useCallback(() => {
    try {
      if (!synthAudioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        synthAudioCtxRef.current = new AudioCtx();
      }
      const ctx = synthAudioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Create a cool party synth sequence
      const notes = [261.63, 329.63, 392.00, 523.25, 440.00];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.4 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.4);
        osc.stop(ctx.currentTime + idx * 0.4 + 0.4);
      });
      setIsPlaying(true);
    } catch (e) {
      console.warn('Synth fallback error:', e);
    }
  }, []);

  const playTrack = useCallback(async (track: SpotifyTrack) => {
    setCurrentPlayingTrack(track);

    // Stop any previous fallback audio
    if (audioFallbackRef.current) {
      audioFallbackRef.current.pause();
    }

    // Attempt Spotify Web Playback SDK if ready and not fallback mode
    if (!fallbackMode && isReady && deviceId && accessToken && track.uri) {
      try {
        const success = await playSpotifyTrackOnDevice(accessToken, deviceId, track.uri);
        if (success) {
          setIsPlaying(true);
          return;
        }
      } catch (err) {
        console.warn('Direct device playback failed, falling back to preview URL:', err);
      }
    }

    // Fallback mode: HTML5 Audio preview
    if (track.previewUrl && audioFallbackRef.current) {
      audioFallbackRef.current.src = track.previewUrl;
      audioFallbackRef.current.play().catch(err => {
        console.warn('Audio preview autoplay blocked or failed:', err);
        playSynthesizerGroove();
      });
      setIsPlaying(true);
    } else {
      // Fallback synthesizer groove
      playSynthesizerGroove();
    }
  }, [accessToken, deviceId, fallbackMode, isReady, playSynthesizerGroove]);

  const pauseTrack = useCallback(() => {
    if (playerRef.current && !fallbackMode) {
      playerRef.current.pause().catch(() => {});
    }
    if (audioFallbackRef.current) {
      audioFallbackRef.current.pause();
    }
    setIsPlaying(false);
  }, [fallbackMode]);

  return {
    isReady,
    deviceId,
    isPlaying,
    fallbackMode,
    currentPlayingTrack,
    playTrack,
    pauseTrack,
  };
}
