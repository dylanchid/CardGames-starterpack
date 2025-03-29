/**
 * @fileoverview Game page component that loads a specific game session
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/app/supabase/provider';
import GameRoot from '@/app/game/components/GameRoot';
import GameBoard from '@/app/game/components/GameBoard';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/app/components/ui/button';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { supabase, session } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<{ gameId: string; ownerId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchGameData = async () => {
      if (!id || !session?.user?.id) {
        return;
      }

      try {
        setLoading(true);
        
        // Fetch the game data from Supabase
        const { data, error } = await supabase
          .from('games')
          .select('id, owner_id')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Game not found');
          return;
        }

        setGameData({
          gameId: data.id as string,
          ownerId: data.owner_id as string,
        });
      } catch (err: any) {
        console.error('Error fetching game:', err);
        setError(err.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [id, session?.user?.id, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>{error}</p>
        <Button onClick={() => router.push('/games')}>Back to Games</Button>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Game Not Found</h1>
        <Button onClick={() => router.push('/games')}>Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GameRoot sessionId={id} userId={session?.user?.id}>
        <GameBoard />
      </GameRoot>
    </div>
  );
} 