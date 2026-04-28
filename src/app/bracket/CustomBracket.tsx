"use client";

import React from "react";
import { type RouterOutputs } from "~/trpc/react";

type Match = RouterOutputs["bracket"]["getAllMatches"][number];

interface CustomBracketProps {
  matches: Match[];
  isAdmin: boolean;
  onMatchClick: (match: Match) => void;
}

export function CustomBracket({ matches, isAdmin, onMatchClick }: CustomBracketProps) {
  // Group matches by winner/loser bracket
  const winnersMatches = matches.filter((m) => !m.isLoserBracket);
  const losersMatches = matches.filter((m) => m.isLoserBracket);

  // Group by round
  const groupByRound = (mList: Match[]) => {
    const rounds: Record<string, Match[]> = {};
    mList.forEach((m) => {
      if (!rounds[m.tournamentRoundText]) {
        rounds[m.tournamentRoundText] = [];
      }
      rounds[m.tournamentRoundText]!.push(m);
    });
    // Sort rounds - this might need more logic if names aren't simple
    // For now we'll rely on the order they appear or a predefined order
    return Object.entries(rounds).sort((a, b) => {
        // Simple heuristic for sorting rounds
        const order = ["W-R1", "W-R2", "W-R3", "W-Final", "L-R1", "L-R2", "L-R3", "L-Final", "Grand Final"];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
  };

  const winnersRounds = groupByRound(winnersMatches);
  const losersRounds = groupByRound(losersMatches);

  return (
    <div className="flex flex-col gap-16 p-12 overflow-auto h-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 transition-all">
      {/* Winners Bracket */}
      <section className="relative">
        <div className="sticky left-0 z-10 mb-8 flex items-center gap-3 bg-[#0f111a]/80 backdrop-blur-sm py-2">
          <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Winners Bracket</h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.3em]">Championship Path</p>
          </div>
        </div>
        <div className="flex gap-20 items-start pb-4">
          {winnersRounds.map(([roundName, roundMatches]) => (
            <div key={roundName} className="flex flex-col gap-8 min-w-[240px]">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 px-2">
                {roundName}
              </div>
              <div className="flex flex-col justify-around h-full gap-8">
                {roundMatches.sort((a,b) => a.id - b.id).map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isAdmin={isAdmin} 
                    onClick={() => onMatchClick(match)} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Losers Bracket */}
      <section className="relative">
        <div className="sticky left-0 z-10 mb-8 flex items-center gap-3 bg-[#0f111a]/80 backdrop-blur-sm py-2">
          <div className="w-1.5 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Losers Bracket</h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.3em]">Redemption Path</p>
          </div>
        </div>
        <div className="flex gap-20 items-start pb-4">
          {losersRounds.map(([roundName, roundMatches]) => (
            <div key={roundName} className="flex flex-col gap-8 min-w-[240px]">
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 px-2">
                {roundName}
              </div>
              <div className="flex flex-col justify-around h-full gap-8">
                {roundMatches.sort((a,b) => a.id - b.id).map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isAdmin={isAdmin} 
                    onClick={() => onMatchClick(match)} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MatchCard({ match, isAdmin, onClick }: { match: Match; isAdmin: boolean; onClick: () => void }) {
  const isDone = match.state === "DONE";
  
  return (
    <div 
      className={`
        group relative flex flex-col w-full rounded-xl overflow-hidden border transition-all duration-300
        ${isAdmin ? "cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(142,197,252,0.2)]" : ""}
        ${isDone ? "border-white/10 bg-white/5" : "border-white/20 bg-white/10"}
        ${isAdmin ? "hover:border-blue-400/50" : "border-white/10"}
      `}
      onClick={onClick}
    >
      {/* Match ID Badge */}
      <div className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 rounded-bl-lg">
        #{match.id}
      </div>

      {/* Team 1 */}
      <div className={`
        flex items-center justify-between p-3 border-b border-white/5
        ${match.winnerId === match.team1Id && match.winnerId ? "bg-green-500/10" : ""}
      `}>
        <div className="flex items-center gap-3">
          <div className={`w-1 h-4 rounded-full ${match.winnerId === match.team1Id && match.winnerId ? "bg-green-500" : "bg-white/10"}`}></div>
          <span className={`text-sm font-medium ${match.winnerId === match.team1Id && match.winnerId ? "text-green-400" : "text-white/80"}`}>
            {match.team1?.name ?? "TBD"}
          </span>
        </div>
        {match.winnerId === match.team1Id && match.winnerId && (
          <span className="text-[10px] font-bold text-green-500 px-1.5 py-0.5 rounded bg-green-500/20">WIN</span>
        )}
      </div>

      {/* Team 2 */}
      <div className={`
        flex items-center justify-between p-3
        ${match.winnerId === match.team2Id && match.winnerId ? "bg-green-500/10" : ""}
      `}>
        <div className="flex items-center gap-3">
          <div className={`w-1 h-4 rounded-full ${match.winnerId === match.team2Id && match.winnerId ? "bg-green-500" : "bg-white/10"}`}></div>
          <span className={`text-sm font-medium ${match.winnerId === match.team2Id && match.winnerId ? "text-green-400" : "text-white/80"}`}>
            {match.team2?.name ?? "TBD"}
          </span>
        </div>
        {match.winnerId === match.team2Id && match.winnerId && (
          <span className="text-[10px] font-bold text-green-500 px-1.5 py-0.5 rounded bg-green-500/20">WIN</span>
        )}
      </div>

      {/* Hover Overlay for Admin */}
      {isAdmin && !isDone && (
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors pointer-events-none flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold uppercase tracking-wider text-blue-400 transition-opacity">
            Select Winner
          </span>
        </div>
      )}
    </div>
  );
}
