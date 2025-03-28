import React from 'react';
import { Card } from '../../components/ui/card';

export const metadata = {
  title: 'Leaderboard | Ninety-Nine Card Game',
  description: 'View the top players in the Ninety-Nine card game.',
};

// Sample leaderboard data - in a real app, this would come from a database
const leaderboardData = [
  { id: 1, name: 'CardMaster99', wins: 48, games: 65, highScore: 124 },
  { id: 2, name: 'TrickTaker', wins: 42, games: 61, highScore: 118 },
  { id: 3, name: 'AceOfBids', wins: 39, games: 58, highScore: 110 },
  { id: 4, name: 'HeartBreaker', wins: 35, games: 50, highScore: 105 },
  { id: 5, name: 'RoyalFlush', wins: 32, games: 47, highScore: 102 },
  { id: 6, name: 'TrumpKing', wins: 28, games: 45, highScore: 98 },
  { id: 7, name: 'DiamondDealer', wins: 26, games: 42, highScore: 96 },
  { id: 8, name: 'ClubChampion', wins: 24, games: 40, highScore: 93 },
  { id: 9, name: 'SpadeSpecialist', wins: 22, games: 38, highScore: 91 },
  { id: 10, name: 'JackOfAllCards', wins: 20, games: 35, highScore: 88 },
];

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Leaderboard</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6 shadow overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Top Players</h2>
            <div className="text-sm text-gray-500">Updated daily</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wins</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboardData.map((player, index) => (
                  <tr key={player.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`flex items-center justify-center h-6 w-6 rounded-full ${
                          index === 0 ? 'bg-yellow-400' : 
                          index === 1 ? 'bg-gray-300' : 
                          index === 2 ? 'bg-amber-600' : 'bg-gray-100'
                        } text-sm font-medium`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Math.round((player.wins / player.games) * 100)}%</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.games}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.wins}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{player.highScore}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow bg-blue-50">
            <h3 className="text-xl font-semibold mb-3">Most Games Played</h3>
            <p className="text-sm text-gray-600 mb-4">Players with the most experience</p>
            <ol className="list-decimal pl-5 space-y-2">
              {[...leaderboardData]
                .sort((a, b) => b.games - a.games)
                .slice(0, 5)
                .map(player => (
                  <li key={player.id} className="text-sm">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-gray-500"> - {player.games} games</span>
                  </li>
                ))
              }
            </ol>
          </Card>
          
          <Card className="p-6 shadow bg-green-50">
            <h3 className="text-xl font-semibold mb-3">Highest Win Rate</h3>
            <p className="text-sm text-gray-600 mb-4">Most efficient players (min. 10 games)</p>
            <ol className="list-decimal pl-5 space-y-2">
              {[...leaderboardData]
                .sort((a, b) => (b.wins / b.games) - (a.wins / a.games))
                .slice(0, 5)
                .map(player => (
                  <li key={player.id} className="text-sm">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-gray-500"> - {Math.round((player.wins / player.games) * 100)}%</span>
                  </li>
                ))
              }
            </ol>
          </Card>
          
          <Card className="p-6 shadow bg-purple-50">
            <h3 className="text-xl font-semibold mb-3">Top High Scores</h3>
            <p className="text-sm text-gray-600 mb-4">Highest single-game scores</p>
            <ol className="list-decimal pl-5 space-y-2">
              {[...leaderboardData]
                .sort((a, b) => b.highScore - a.highScore)
                .slice(0, 5)
                .map(player => (
                  <li key={player.id} className="text-sm">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-gray-500"> - {player.highScore} points</span>
                  </li>
                ))
              }
            </ol>
          </Card>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500 text-sm">
            Leaderboard data is updated daily. Play more games to improve your ranking!
          </p>
        </div>
      </div>
    </div>
  );
} 