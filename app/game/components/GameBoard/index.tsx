'use client';

import React from 'react';
import { GameBoard as GameBoardComponent } from './GameBoard';

/**
 * Default export for GameBoard component
 */
export default function GameBoard() {
  return (
    <div className="w-full h-full">
      <GameBoardComponent />
    </div>
  );
} 