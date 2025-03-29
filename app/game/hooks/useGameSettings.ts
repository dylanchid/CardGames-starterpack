/**
 * @fileoverview Hook for handling game settings and preferences
 */

import { useCallback, useEffect, useState } from 'react';
import { useGame } from '../components/core/GameProvider';
import { GameSettings } from '../../types/core/GameTypes';

const SETTINGS_STORAGE_KEY = 'ninety-nine-game-settings';

interface GamePreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  darkMode: boolean;
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  cardStyle: 'classic' | 'modern' | 'minimal';
  autoPlay: boolean;
  autoBid: boolean;
  showHints: boolean;
  showTutorial: boolean;
}

const DEFAULT_PREFERENCES: GamePreferences = {
  soundEnabled: true,
  musicEnabled: true,
  animationsEnabled: true,
  darkMode: false,
  language: 'en',
  fontSize: 'medium',
  cardStyle: 'modern',
  autoPlay: false,
  autoBid: false,
  showHints: true,
  showTutorial: true,
};

export const useGameSettings = () => {
  const { state, actions } = useGame();
  const [preferences, setPreferences] = useState<GamePreferences>(DEFAULT_PREFERENCES);
  
  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    try {
      const savedPreferences = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);
  
  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<GamePreferences>) => {
    try {
      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);
  
  // Update game settings
  const updateGameSettings = useCallback((settings: Partial<GameSettings>) => {
    actions.updateSettings({
      ...state.core.settings,
      ...settings,
    });
  }, [actions, state.core.settings]);
  
  // Toggle sound
  const toggleSound = useCallback(() => {
    savePreferences({ soundEnabled: !preferences.soundEnabled });
  }, [preferences.soundEnabled, savePreferences]);
  
  // Toggle music
  const toggleMusic = useCallback(() => {
    savePreferences({ musicEnabled: !preferences.musicEnabled });
  }, [preferences.musicEnabled, savePreferences]);
  
  // Toggle animations
  const toggleAnimations = useCallback(() => {
    savePreferences({ animationsEnabled: !preferences.animationsEnabled });
  }, [preferences.animationsEnabled, savePreferences]);
  
  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    savePreferences({ darkMode: !preferences.darkMode });
  }, [preferences.darkMode, savePreferences]);
  
  // Set language
  const setLanguage = useCallback((language: string) => {
    savePreferences({ language });
  }, [savePreferences]);
  
  // Set font size
  const setFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    savePreferences({ fontSize: size });
  }, [savePreferences]);
  
  // Set card style
  const setCardStyle = useCallback((style: 'classic' | 'modern' | 'minimal') => {
    savePreferences({ cardStyle: style });
  }, [savePreferences]);
  
  // Toggle auto play
  const toggleAutoPlay = useCallback(() => {
    savePreferences({ autoPlay: !preferences.autoPlay });
  }, [preferences.autoPlay, savePreferences]);
  
  // Toggle auto bid
  const toggleAutoBid = useCallback(() => {
    savePreferences({ autoBid: !preferences.autoBid });
  }, [preferences.autoBid, savePreferences]);
  
  // Toggle hints
  const toggleHints = useCallback(() => {
    savePreferences({ showHints: !preferences.showHints });
  }, [preferences.showHints, savePreferences]);
  
  // Toggle tutorial
  const toggleTutorial = useCallback(() => {
    savePreferences({ showTutorial: !preferences.showTutorial });
  }, [preferences.showTutorial, savePreferences]);
  
  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);
  
  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  // Apply preferences to document
  useEffect(() => {
    // Apply dark mode
    document.documentElement.classList.toggle('dark', preferences.darkMode);
    
    // Apply font size
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    document.documentElement.classList.add(`text-${preferences.fontSize}`);
    
    // Apply card style
    document.documentElement.classList.remove('card-classic', 'card-modern', 'card-minimal');
    document.documentElement.classList.add(`card-${preferences.cardStyle}`);
  }, [preferences.darkMode, preferences.fontSize, preferences.cardStyle]);
  
  return {
    preferences,
    gameSettings: state.core.settings,
    updateGameSettings,
    toggleSound,
    toggleMusic,
    toggleAnimations,
    toggleDarkMode,
    setLanguage,
    setFontSize,
    setCardStyle,
    toggleAutoPlay,
    toggleAutoBid,
    toggleHints,
    toggleTutorial,
    resetPreferences,
  };
}; 