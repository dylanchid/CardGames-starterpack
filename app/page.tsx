import Link from "next/link";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Button } from "@/components/ui/button";
import { Card } from "../components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Ninety-Nine Card Game</h1>
          <p className="max-w-[700px] text-lg text-white/90 md:text-xl">
            A strategic trick-taking card game where your bids and plays determine your fate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/game">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Play Now
              </Button>
            </Link>
            <Link href="#how-to-play">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                How to Play
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Game Features */}
      <section className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col gap-2 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Strategic Gameplay</h3>
            <p className="text-gray-600">Plan your moves, predict your opponents, and strategize your way to victory.</p>
          </Card>
          <Card className="p-6 flex flex-col gap-2 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-700">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Multiplayer Support</h3>
            <p className="text-gray-600">Play against friends or challenging AI opponents to test your skills.</p>
          </Card>
          <Card className="p-6 flex flex-col gap-2 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Track Your Progress</h3>
            <p className="text-gray-600">Keep track of your scores, achievements, and improvement over time.</p>
          </Card>
        </div>
      </section>

      {/* How to Play Section */}
      <section id="how-to-play" className="container px-4 md:px-6 py-12 bg-gray-50 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-8">How to Play</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Game Objective</h3>
            <p>In Ninety-Nine, your goal is to accurately predict how many tricks you'll win in each round, then achieve exactly that number.</p>
            
            <h3 className="text-xl font-semibold">Bidding Phase</h3>
            <p>Each player secretly places a bid indicating how many tricks they think they'll win. These bids are revealed simultaneously.</p>
            
            <h3 className="text-xl font-semibold">Trick-Taking</h3>
            <p>Players take turns playing cards. The highest card of the leading suit wins the trick, or a trump card if played.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Scoring</h3>
            <p>Players who win exactly the number of tricks they bid earn positive points. Missing your bid results in negative points.</p>
            
            <h3 className="text-xl font-semibold">Strategy Tips</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Count cards to track what's been played</li>
              <li>Watch your opponents' playing patterns</li>
              <li>Sometimes it's best to intentionally lose a trick</li>
              <li>High cards aren't always the best play</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link href="/game">
            <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
              Start Your First Game
            </Button>
          </Link>
        </div>
      </section>

      {/* Getting Started Section */}
      {!hasEnvVars && (
        <section className="container px-4 md:px-6">
          <Card className="p-6 border-yellow-200 bg-yellow-50">
            <h3 className="text-xl font-bold mb-4">Setup Your Environment</h3>
            <p className="mb-4">To get the full game experience with data persistence and multiplayer, you'll need to connect your Supabase database.</p>
            <Link href="/notes">
              <Button variant="outline">
                View Setup Instructions
              </Button>
            </Link>
          </Card>
        </section>
      )}
    </div>
  );
}
