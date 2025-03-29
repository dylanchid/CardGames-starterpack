/**
 * @fileoverview Hook for handling game internationalization
 */

import { useCallback, useEffect, useState } from 'react';
import { useGameSettings } from './useGameSettings';

interface Translation {
  [key: string]: string | Translation;
}

interface I18nState {
  locale: string;
  translations: Record<string, Translation>;
  fallbackLocale: string;
}

const DEFAULT_LOCALE = 'en';
const FALLBACK_LOCALE = 'en';

const TRANSLATIONS: Record<string, Translation> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
    game: {
      title: 'Ninety-Nine Card Game',
      start: 'Start Game',
      join: 'Join Game',
      leave: 'Leave Game',
      reset: 'Reset Game',
      settings: 'Game Settings',
      players: 'Players',
      currentPlayer: 'Current Player',
      waiting: 'Waiting for players...',
      ready: 'Ready',
      notReady: 'Not Ready',
      phase: {
        setup: 'Game Setup',
        bidding: 'Bidding Phase',
        playing: 'Playing Phase',
        scoring: 'Scoring Phase',
        complete: 'Game Complete',
      },
    },
    cards: {
      suits: {
        hearts: 'Hearts',
        diamonds: 'Diamonds',
        clubs: 'Clubs',
        spades: 'Spades',
      },
      values: {
        ace: 'Ace',
        king: 'King',
        queen: 'Queen',
        jack: 'Jack',
      },
      play: 'Play Card',
      select: 'Select Card',
      discard: 'Discard Card',
    },
    bidding: {
      title: 'Place Your Bid',
      current: 'Current Bid',
      place: 'Place Bid',
      reveal: 'Reveal Bids',
      waiting: 'Waiting for bids...',
      complete: 'Bidding Complete',
    },
    scoring: {
      title: 'Game Score',
      tricks: 'Tricks',
      points: 'Points',
      total: 'Total',
      winner: 'Winner',
      loser: 'Loser',
      tie: 'Tie',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      sound: 'Sound',
      music: 'Music',
      animations: 'Animations',
      darkMode: 'Dark Mode',
      accessibility: 'Accessibility',
      save: 'Save Settings',
      reset: 'Reset Settings',
    },
    errors: {
      connection: 'Connection Error',
      gameNotFound: 'Game Not Found',
      invalidMove: 'Invalid Move',
      invalidBid: 'Invalid Bid',
      gameFull: 'Game is Full',
      notYourTurn: 'Not Your Turn',
      serverError: 'Server Error',
      networkError: 'Network Error',
    },
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
    },
    game: {
      title: 'Juego de Cartas Noventa y Nueve',
      start: 'Iniciar Juego',
      join: 'Unirse al Juego',
      leave: 'Abandonar Juego',
      reset: 'Reiniciar Juego',
      settings: 'Configuración del Juego',
      players: 'Jugadores',
      currentPlayer: 'Jugador Actual',
      waiting: 'Esperando jugadores...',
      ready: 'Listo',
      notReady: 'No Listo',
      phase: {
        setup: 'Configuración del Juego',
        bidding: 'Fase de Puja',
        playing: 'Fase de Juego',
        scoring: 'Fase de Puntuación',
        complete: 'Juego Completado',
      },
    },
    cards: {
      suits: {
        hearts: 'Corazones',
        diamonds: 'Diamantes',
        clubs: 'Tréboles',
        spades: 'Picas',
      },
      values: {
        ace: 'As',
        king: 'Rey',
        queen: 'Reina',
        jack: 'Jota',
      },
      play: 'Jugar Carta',
      select: 'Seleccionar Carta',
      discard: 'Descartar Carta',
    },
    bidding: {
      title: 'Haz tu Puja',
      current: 'Puja Actual',
      place: 'Hacer Puja',
      reveal: 'Revelar Pujas',
      waiting: 'Esperando pujas...',
      complete: 'Pujas Completadas',
    },
    scoring: {
      title: 'Puntuación del Juego',
      tricks: 'Bazas',
      points: 'Puntos',
      total: 'Total',
      winner: 'Ganador',
      loser: 'Perdedor',
      tie: 'Empate',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      sound: 'Sonido',
      music: 'Música',
      animations: 'Animaciones',
      darkMode: 'Modo Oscuro',
      accessibility: 'Accesibilidad',
      save: 'Guardar Configuración',
      reset: 'Reiniciar Configuración',
    },
    errors: {
      connection: 'Error de Conexión',
      gameNotFound: 'Juego No Encontrado',
      invalidMove: 'Movimiento Inválido',
      invalidBid: 'Puja Inválida',
      gameFull: 'Juego Lleno',
      notYourTurn: 'No es tu Turno',
      serverError: 'Error del Servidor',
      networkError: 'Error de Red',
    },
  },
};

export const useGameI18n = () => {
  const { preferences } = useGameSettings();
  const [i18nState, setI18nState] = useState<I18nState>({
    locale: preferences.language || DEFAULT_LOCALE,
    translations: TRANSLATIONS,
    fallbackLocale: FALLBACK_LOCALE,
  });
  
  // Update locale when preferences change
  useEffect(() => {
    setI18nState(prev => ({
      ...prev,
      locale: preferences.language || DEFAULT_LOCALE,
    }));
  }, [preferences.language]);
  
  // Translate text
  const t = useCallback((key: string, params: Record<string, string> = {}): string => {
    const keys = key.split('.');
    let translation: Translation | string = i18nState.translations[i18nState.locale];
    
    // Try to find translation in current locale
    for (const k of keys) {
      if (typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        translation = i18nState.translations[i18nState.fallbackLocale];
        for (const k of keys) {
          if (typeof translation === 'object' && k in translation) {
            translation = translation[k];
          } else {
            return key;
          }
        }
      }
    }
    
    // Replace parameters
    if (typeof translation === 'string') {
      return translation.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`);
    }
    
    return key;
  }, [i18nState.locale, i18nState.translations, i18nState.fallbackLocale]);
  
  // Format number
  const formatNumber = useCallback((value: number): string => {
    return new Intl.NumberFormat(i18nState.locale).format(value);
  }, [i18nState.locale]);
  
  // Format date
  const formatDate = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat(i18nState.locale).format(date);
  }, [i18nState.locale]);
  
  // Format time
  const formatTime = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat(i18nState.locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, [i18nState.locale]);
  
  // Format currency
  const formatCurrency = useCallback((value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat(i18nState.locale, {
      style: 'currency',
      currency,
    }).format(value);
  }, [i18nState.locale]);
  
  // Get current locale
  const getLocale = useCallback(() => {
    return i18nState.locale;
  }, [i18nState.locale]);
  
  // Set locale
  const setLocale = useCallback((locale: string) => {
    if (locale in i18nState.translations) {
      setI18nState(prev => ({
        ...prev,
        locale,
      }));
    }
  }, [i18nState.translations]);
  
  // Get available locales
  const getAvailableLocales = useCallback(() => {
    return Object.keys(i18nState.translations);
  }, [i18nState.translations]);
  
  return {
    t,
    formatNumber,
    formatDate,
    formatTime,
    formatCurrency,
    getLocale,
    setLocale,
    getAvailableLocales,
  };
}; 