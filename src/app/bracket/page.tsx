/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
"use client";


import { DoubleEliminationBracket, Match, SVGViewer } from "@g-loot/react-tournament-brackets";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useWindowSize } from "./useWindowSize";
import { authClient } from "~/server/better-auth/client";

export default function BracketPage() {
  const { data: matches, isLoading, refetch } = api.bracket.getAllMatches.useQuery();
  const updateMatchMutation = api.bracket.updateMatch.useMutation({
    onSuccess: () => refetch(),
  });
  
  const [windowWidth, windowHeight] = useWindowSize();
  const { data: sessionData } = authClient.useSession();
  const isAdmin = !!sessionData?.session;



  if (isLoading) {
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

  // Transform matches
  const transformedMatches = matches.map((match) => {
    const participants = [];
    
    // Team 1
    if (match.team1Id) {
      participants.push({
        id: match.team1?.id?.toString() ?? `t1-${match.id}`,
        resultText: match.winnerId === match.team1Id ? "WIN" : match.winnerId ? "LOSS" : "",
        isWinner: match.winnerId === match.team1Id,
        status: match.state === "DONE" ? "PLAYED" : null,
        name: match.team1?.name ?? "TBD",
      });
    } else {
      participants.push({
        id: `tbd1-${match.id}`,
        resultText: "",
        isWinner: false,
        status: null,
        name: "TBD",
      });
    }

    // Team 2
    if (match.team2Id) {
      participants.push({
        id: match.team2?.id?.toString() ?? `t2-${match.id}`,
        resultText: match.winnerId === match.team2Id ? "WIN" : match.winnerId ? "LOSS" : "",
        isWinner: match.winnerId === match.team2Id,
        status: match.state === "DONE" ? "PLAYED" : null,
        name: match.team2?.name ?? "TBD",
      });
    } else {
      participants.push({
        id: `tbd2-${match.id}`,
        resultText: "",
        isWinner: false,
        status: null,
        name: "TBD",
      });
    }

    return {
      id: match.id,
      name: `Match ${match.id}`,
      nextMatchId: match.nextMatchId,
      nextLooserMatchId: match.nextLooserMatchId,
      tournamentRoundText: match.tournamentRoundText,
      startTime: "",
      state: match.winnerId ? "DONE" : "SCHEDULED",
      participants,
    };
  });

  interface MatchData {
    id: number;
    participants: {
      id: string;
      resultText: string;
      isWinner: boolean;
      status: string | null;
      name: string;
    }[];
  }

  const handleMatchClick = (match: MatchData) => {
    if (!isAdmin) return; // Only admins can interact
    
    // Simple logic to advance a team
    // In a real app, you'd show a modal to select the winner and enter score
    const p1 = match.participants[0];
    const p2 = match.participants[1];
    
    if (!p1 || !p2 || p1.name === "TBD" || p2.name === "TBD") {
      alert("Cannot complete match: Both teams must be determined first.");
      return;
    }

    const winnerName = window.prompt(`Who won this match? Enter 1 for ${p1.name} or 2 for ${p2.name}`);
    if (winnerName === "1") {
      updateMatchMutation.mutate({
        matchId: match.id,
        winnerId: parseInt(p1.id),
        state: "DONE",
      });
    } else if (winnerName === "2") {
      updateMatchMutation.mutate({
        matchId: match.id,
        winnerId: parseInt(p2.id),
        state: "DONE",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#15162c] text-white">
      <div className="p-4 bg-black/30 border-b border-white/10 flex justify-between items-center z-10 relative">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e0c3fc] to-[#8ec5fc]">
          CETA Robotics Tournament
        </h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <span className="px-3 py-1 rounded bg-green-500/20 text-green-300 text-sm font-semibold border border-green-500/30">
              Admin Mode Enabled
            </span>
          )}
          <Link href="/" className="text-sm hover:text-[hsl(280,100%,70%)] transition">
            Home
          </Link>
        </div>
      </div>
      
      <div className="p-8 w-full h-[calc(100vh-80px)] overflow-hidden">
        {isAdmin && <p className="text-white/50 text-sm mb-4">Click on any scheduled match to advance a winner.</p>}
        
        <DoubleEliminationBracket
          matches={transformedMatches}
          matchComponent={Match}
          svgWrapper={({ children, ...props }: any) => (
            <SVGViewer width={windowWidth} height={windowHeight} {...props}>
              {children}
            </SVGViewer>
          )}
          onMatchClick={handleMatchClick}
        />
      </div>
    </div>
  );
}
