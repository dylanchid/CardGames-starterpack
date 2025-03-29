/**
 * @fileoverview Hook for handling game keyboard shortcuts
 */

import { useCallback, useEffect } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameSettings } from './useGameSettings';
import { useGameAudio } from './useGameAudio';
import { NinetyNineGameState } from '../types/game';
import { GameState } from '../../types/core/GameTypes';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export const useGameShortcuts = () => {
  const { state, actions } = useGame();
  const { preferences, toggleMusic, toggleSound, toggleDarkMode, toggleHints, toggleTutorial, setFontSize, setCardStyle } = useGameSettings();
  const { playSoundEffect } = useGameAudio();
  
  // Define shortcuts
  const shortcuts: Shortcut[] = [
    {
      key: ' ',
      action: () => {
        if (state.core.phase === 'bidding') {
          actions.revealBids();
        } else if (state.core.phase === 'playing') {
          // Get the first valid card from the current player's hand
          const currentPlayerId = state.relationships.currentPlayer;
          if (currentPlayerId) {
            const currentPlayer = state.entities.players[currentPlayerId];
            if (currentPlayer?.hand?.length) {
              actions.playCard(currentPlayer.hand[0]);
            }
          }
        }
      },
      description: 'Space - Reveal bids or play card',
    },
    {
      key: 'Escape',
      action: () => {
        actions.cancelAction();
        actions.setSelectedCards([]);
        actions.setDraggedCard(null);
      },
      description: 'Esc - Cancel action or clear selection',
    },
    {
      key: 'r',
      ctrl: true,
      action: () => {
        actions.resetGame();
      },
      description: 'Ctrl+R - Reset game',
    },
    {
      key: 'm',
      action: () => {
        toggleMusic();
      },
      description: 'M - Toggle music',
    },
    {
      key: 's',
      action: () => {
        toggleSound();
      },
      description: 'S - Toggle sound',
    },
    {
      key: 'd',
      action: () => {
        toggleDarkMode();
      },
      description: 'D - Toggle dark mode',
    },
    {
      key: 'h',
      action: () => {
        toggleHints();
      },
      description: 'H - Toggle hints',
    },
    {
      key: 't',
      action: () => {
        toggleTutorial();
      },
      description: 'T - Toggle tutorial',
    },
    {
      key: '1',
      action: () => {
        setFontSize('small');
      },
      description: '1 - Small font size',
    },
    {
      key: '2',
      action: () => {
        setFontSize('medium');
      },
      description: '2 - Medium font size',
    },
    {
      key: '3',
      action: () => {
        setFontSize('large');
      },
      description: '3 - Large font size',
    },
    {
      key: 'c',
      action: () => {
        setCardStyle('classic');
      },
      description: 'C - Classic card style',
    },
    {
      key: 'm',
      action: () => {
        setCardStyle('modern');
      },
      description: 'M - Modern card style',
    },
    {
      key: 'n',
      action: () => {
        setCardStyle('minimal');
      },
      description: 'N - Minimal card style',
    },
  ];
  
  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    
    // Check each shortcut
    for (const shortcut of shortcuts) {
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrl &&
        !!event.shiftKey === !!shortcut.shift &&
        !!event.altKey === !!shortcut.alt &&
        !!event.metaKey === !!shortcut.meta
      ) {
        event.preventDefault();
        shortcut.action();
        playSoundEffect('buttonClick');
        break;
      }
    }
  }, [shortcuts, playSoundEffect]);
  
  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Return shortcuts for display in UI
  return {
    shortcuts,
  };
}; 