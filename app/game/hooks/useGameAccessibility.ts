/**
 * @fileoverview Hook for handling game accessibility features
 */

import { useCallback, useEffect, useState } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameSettings } from './useGameSettings';
import { useGameAudio } from './useGameAudio';

interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  screenReaderEnabled: true,
  highContrastMode: false,
  reducedMotion: false,
  largeText: false,
  colorBlindMode: 'none',
  keyboardNavigation: true,
  focusVisible: true,
};

export const useGameAccessibility = () => {
  const { state } = useGame();
  const { preferences } = useGameSettings();
  const { playSoundEffect } = useGameAudio();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  
  // Load accessibility settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('game-accessibility-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  }, []);
  
  // Save accessibility settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      localStorage.setItem('game-accessibility-settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }, [settings]);
  
  // Toggle screen reader
  const toggleScreenReader = useCallback(() => {
    saveSettings({ screenReaderEnabled: !settings.screenReaderEnabled });
  }, [settings.screenReaderEnabled, saveSettings]);
  
  // Toggle high contrast mode
  const toggleHighContrast = useCallback(() => {
    saveSettings({ highContrastMode: !settings.highContrastMode });
  }, [settings.highContrastMode, saveSettings]);
  
  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    saveSettings({ reducedMotion: !settings.reducedMotion });
  }, [settings.reducedMotion, saveSettings]);
  
  // Toggle large text
  const toggleLargeText = useCallback(() => {
    saveSettings({ largeText: !settings.largeText });
  }, [settings.largeText, saveSettings]);
  
  // Set color blind mode
  const setColorBlindMode = useCallback((mode: AccessibilitySettings['colorBlindMode']) => {
    saveSettings({ colorBlindMode: mode });
  }, [saveSettings]);
  
  // Toggle keyboard navigation
  const toggleKeyboardNavigation = useCallback(() => {
    saveSettings({ keyboardNavigation: !settings.keyboardNavigation });
  }, [settings.keyboardNavigation, saveSettings]);
  
  // Toggle focus visible
  const toggleFocusVisible = useCallback(() => {
    saveSettings({ focusVisible: !settings.focusVisible });
  }, [settings.focusVisible, saveSettings]);
  
  // Announce game state changes
  const announceStateChange = useCallback((message: string) => {
    if (!settings.screenReaderEnabled) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('role', 'status');
    announcement.style.position = 'absolute';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.padding = '0';
    announcement.style.margin = '-1px';
    announcement.style.overflow = 'hidden';
    announcement.style.clip = 'rect(0, 0, 0, 0)';
    announcement.style.whiteSpace = 'nowrap';
    announcement.style.border = '0';
    
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 5000);
  }, [settings.screenReaderEnabled]);
  
  // Apply accessibility settings to document
  useEffect(() => {
    // Apply high contrast mode
    document.documentElement.classList.toggle('high-contrast', settings.highContrastMode);
    
    // Apply reduced motion
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Apply large text
    document.documentElement.classList.toggle('large-text', settings.largeText);
    
    // Apply color blind mode
    document.documentElement.classList.remove('color-blind-none', 'color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
    document.documentElement.classList.add(`color-blind-${settings.colorBlindMode}`);
    
    // Apply keyboard navigation
    document.documentElement.classList.toggle('keyboard-navigation', settings.keyboardNavigation);
    
    // Apply focus visible
    document.documentElement.classList.toggle('focus-visible', settings.focusVisible);
  }, [
    settings.highContrastMode,
    settings.reducedMotion,
    settings.largeText,
    settings.colorBlindMode,
    settings.keyboardNavigation,
    settings.focusVisible,
  ]);
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  // Announce game state changes
  useEffect(() => {
    if (state.core.lastAction) {
      announceStateChange(state.core.lastAction);
    }
  }, [state.core.lastAction, announceStateChange]);
  
  return {
    settings,
    toggleScreenReader,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    setColorBlindMode,
    toggleKeyboardNavigation,
    toggleFocusVisible,
    announceStateChange,
  };
}; 