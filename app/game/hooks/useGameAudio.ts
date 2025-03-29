/**
 * @fileoverview Hook for handling game sound effects and music
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGameSettings } from './useGameSettings';

interface AudioTrack {
  id: string;
  url: string;
  volume: number;
  loop: boolean;
}

interface SoundEffect {
  id: string;
  url: string;
  volume: number;
}

const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'cardPlay', url: '/sounds/card-play.mp3', volume: 0.5 },
  { id: 'cardFlip', url: '/sounds/card-flip.mp3', volume: 0.4 },
  { id: 'trickComplete', url: '/sounds/trick-complete.mp3', volume: 0.6 },
  { id: 'bidPlace', url: '/sounds/bid-place.mp3', volume: 0.5 },
  { id: 'gameStart', url: '/sounds/game-start.mp3', volume: 0.7 },
  { id: 'gameEnd', url: '/sounds/game-end.mp3', volume: 0.7 },
  { id: 'buttonClick', url: '/sounds/button-click.mp3', volume: 0.3 },
  { id: 'error', url: '/sounds/error.mp3', volume: 0.5 },
];

const BACKGROUND_TRACKS: AudioTrack[] = [
  { id: 'menu', url: '/music/menu.mp3', volume: 0.3, loop: true },
  { id: 'gameplay', url: '/music/gameplay.mp3', volume: 0.2, loop: true },
  { id: 'victory', url: '/music/victory.mp3', volume: 0.4, loop: false },
  { id: 'defeat', url: '/music/defeat.mp3', volume: 0.4, loop: false },
];

export const useGameAudio = () => {
  const { preferences } = useGameSettings();
  const audioContext = useRef<AudioContext | null>(null);
  const soundEffects = useRef<Map<string, AudioBuffer>>(new Map());
  const backgroundTracks = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentTrack = useRef<string | null>(null);
  
  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    try {
      audioContext.current = new AudioContext();
      
      // Load sound effects
      for (const effect of SOUND_EFFECTS) {
        const response = await fetch(effect.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
        soundEffects.current.set(effect.id, audioBuffer);
      }
      
      // Load background tracks
      for (const track of BACKGROUND_TRACKS) {
        const audio = new Audio(track.url);
        audio.volume = track.volume;
        audio.loop = track.loop;
        backgroundTracks.current.set(track.id, audio);
      }
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);
  
  // Play sound effect
  const playSoundEffect = useCallback((effectId: string) => {
    if (!preferences.soundEnabled || !audioContext.current) return;
    
    const effect = SOUND_EFFECTS.find(e => e.id === effectId);
    if (!effect) return;
    
    const audioBuffer = soundEffects.current.get(effectId);
    if (!audioBuffer) return;
    
    const source = audioContext.current.createBufferSource();
    const gainNode = audioContext.current.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = effect.volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    source.start(0);
  }, [preferences.soundEnabled]);
  
  // Play background track
  const playBackgroundTrack = useCallback((trackId: string) => {
    if (!preferences.musicEnabled) return;
    
    const track = BACKGROUND_TRACKS.find(t => t.id === trackId);
    if (!track) return;
    
    // Stop current track if playing
    if (currentTrack.current) {
      const currentAudio = backgroundTracks.current.get(currentTrack.current);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }
    
    // Play new track
    const audio = backgroundTracks.current.get(trackId);
    if (audio) {
      audio.volume = track.volume;
      audio.play();
      currentTrack.current = trackId;
    }
  }, [preferences.musicEnabled]);
  
  // Stop background track
  const stopBackgroundTrack = useCallback(() => {
    if (currentTrack.current) {
      const audio = backgroundTracks.current.get(currentTrack.current);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      currentTrack.current = null;
    }
  }, []);
  
  // Set background track volume
  const setBackgroundVolume = useCallback((volume: number) => {
    if (!currentTrack.current) return;
    
    const audio = backgroundTracks.current.get(currentTrack.current);
    if (audio) {
      audio.volume = volume;
    }
  }, []);
  
  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
    
    return () => {
      // Cleanup
      stopBackgroundTrack();
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, [initializeAudio, stopBackgroundTrack]);
  
  // Handle preferences changes
  useEffect(() => {
    if (!preferences.soundEnabled) {
      stopBackgroundTrack();
    }
  }, [preferences.soundEnabled, stopBackgroundTrack]);
  
  return {
    playSoundEffect,
    playBackgroundTrack,
    stopBackgroundTrack,
    setBackgroundVolume,
  };
}; 