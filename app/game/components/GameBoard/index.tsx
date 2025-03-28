'use client';

import React from 'react';
import { GameBoard as GameBoardComponent } from './GameBoard';

/**
 * Default export for GameBoard that wraps the component 
 * The useGameContext hook is already used inside the GameBoard component,
 * so we don't need to explicitly use it here.
 */
export default function GameBoard() {
  return (
    <div className="w-full h-full">
      <GameBoardComponent className="w-full h-full" />
    </div>
  );
}

export { GameBoardComponent as GameBoard }; 