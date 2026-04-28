"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { authClient } from "~/server/better-auth/client";
import { CustomBracket } from "./CustomBracket";

export default function BracketPage() {
  const { data: matches, isLoading, refetch } = api.bracket.getAllMatches.useQuery();
  const updateMatchMutation = api.bracket.updateMatch.useMutation({
    onSuccess: () => refetch(),
  });
  
  const { data: sessionData } = authClient.useSession();
  const isAdmin = !!sessionData?.session;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#15162c] text-white">
        <div className="text-2xl font-bold animate-pulse">Loading Bracket...</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#15162c] text-white flex-col gap-4">
        <div className="text-2xl font-bold">No Bracket Data Found</div>
        <p>Please run the seeder script first.</p>
        <Link href="/" className="text-[hsl(280,100%,70%)] hover:underline">Return Home</Link>
      </div>
    );
  }

  const handleMatchClick = (match: any) => {
    if (!isAdmin) return; // Only admins can interact
    
    const p1 = match.team1;
    const p2 = match.team2;
    
    if (!p1 || !p2) {
      alert("Cannot complete match: Both teams must be determined first.");
      return;
    }

    const winnerName = window.prompt(`Who won this match? Enter 1 for ${p1.name} or 2 for ${p2.name}`);
    if (winnerName === "1") {
      updateMatchMutation.mutate({
        matchId: match.id,
        winnerId: p1.id,
        state: "DONE",
      });
    } else if (winnerName === "2") {
      updateMatchMutation.mutate({
        matchId: match.id,
        winnerId: p2.id,
        state: "DONE",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white overflow-hidden flex flex-col">
      <header className="p-4 bg-black/40 backdrop-blur-md border-b border-white/5 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
              C
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Tournament Bracket
            </h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">CETA Robotics 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
          )}
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 h-full">
          <CustomBracket 
            matches={matches} 
            isAdmin={isAdmin} 
            onMatchClick={handleMatchClick} 
          />
        </div>
      </main>

      {isAdmin && (
        <footer className="p-3 bg-blue-600/10 border-t border-blue-500/20 text-center">
          <p className="text-xs font-medium text-blue-300/80">
            Click on any match to record the outcome and advance teams
          </p>
        </footer>
      )}
    </div>
  );
}

