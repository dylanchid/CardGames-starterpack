'use client';

import React from 'react';
import { GameBoard as GameBoardComponent } from './GameBoard';
import { GameProvider } from './GameProvider';

/**
 * Default export for GameBoard that wraps the component with GameProvider
 * to ensure the useGameContext hook has the context it needs.
 */
export default function GameBoard() {
  return (
    <GameProvider>
      <div className="w-full h-full">
        <WrappedGameBoard />
      </div>
    </GameProvider>
  );
}

/**
 * Helper component that uses context and passes required props to GameBoardComponent
 */
const WrappedGameBoard = () => {
  // The GameBoardComponent now has access to context through the GameProvider
  // This resolves the TypeScript error without needing to manually pass props
  return <GameBoardComponent className="w-full h-full" />;
};

export { GameBoardComponent as GameBoard }; 