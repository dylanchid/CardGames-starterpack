import React, { MouseEventHandler } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';

const GameControlsSchema = z.object({
  isBidding: z.boolean(),
  isPlaying: z.boolean(),
  currentBid: z.number().nullable(),
  onBid: z.function().args(z.number()).returns(z.void()).optional(),
  onStartGame: z.function().args(z.any()).returns(z.void()).optional(),
  onEndGame: z.function().args(z.any()).returns(z.void()).optional(),
});

type GameControlsProps = z.infer<typeof GameControlsSchema>;

export const GameControls: React.FC<GameControlsProps> = ({
  isBidding,
  isPlaying,
  currentBid,
  onBid,
  onStartGame,
  onEndGame,
}) => {
  const bidOptions = Array.from({ length: 13 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      {!isBidding && !isPlaying && (
        <motion.button
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={onStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Game
        </motion.button>
      )}

      {isBidding && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Place your bid:</h3>
          <div className="grid grid-cols-7 gap-2">
            {bidOptions.map((bid) => (
              <motion.button
                key={bid}
                className={`
                  px-4 py-2 rounded-lg transition-colors
                  ${currentBid === bid ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}
                `}
                onClick={() => onBid?.(bid)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {bid}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {isPlaying && (
        <motion.button
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={onEndGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          End Game
        </motion.button>
      )}
    </div>
  );
}; 