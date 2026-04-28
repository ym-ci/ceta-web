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
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-sm font-bold uppercase tracking-[0.5em] animate-pulse">Loading</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white flex-col gap-6">
        <div className="text-sm font-bold uppercase tracking-[0.3em]">No Data Found</div>
        <p className="text-xs text-white/40 uppercase tracking-widest">Please run the seeder script.</p>
        <Link href="/" className="text-xs font-bold border border-white px-4 py-2 hover:bg-white hover:text-black transition-all uppercase tracking-widest">Return Home</Link>
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
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col font-sans">
      <header className="p-4 bg-black border-b border-white/10 flex justify-between items-center z-20">
        <div className="flex items-center gap-6">
          <Link href="/" className="group">
            <div className="w-12 h-12 border border-white flex items-center justify-center text-xl font-bold group-hover:bg-white group-hover:text-black transition-all">
              C
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">
              Tournament Bracket
            </h1>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.4em]">CETA Robotics 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/20">
              <div className="w-1.5 h-1.5 bg-white"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Admin Active
              </span>
            </div>
          )}
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden bg-black">
        <div className="relative z-10 h-full">
          <CustomBracket 
            matches={matches} 
            isAdmin={isAdmin} 
            onMatchClick={handleMatchClick} 
          />
        </div>
      </main>

      {isAdmin && (
        <footer className="p-2 bg-white text-black text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Admin Mode: Click match to record outcome
          </p>
        </footer>
      )}
    </div>
  );
}

