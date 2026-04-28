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
      rounds[m.tournamentRoundText] ??= [];
      rounds[m.tournamentRoundText]!.push(m);
    });
    // Sort rounds - this might need more logic if names aren't simple
    // For now we'll rely on the order they appear or a predefined order
    return Object.entries(rounds).sort((a, b) => {
        // Simple heuristic for sorting rounds
        const order = ["W-R1", "W-R2", "W-R3", "W-Final", "L-R1", "L-R2", "L-R3", "L-Final"];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
  };

  const winnersRounds = groupByRound(winnersMatches);
  const losersRounds = groupByRound(losersMatches);

  return (
    <div className="flex flex-col gap-16 p-12 overflow-auto h-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 transition-all">
      {/* Winners Bracket */}
      <section className="relative">
        <div className="sticky left-0 z-10 mb-8 flex items-center gap-3 bg-black/80 backdrop-blur-sm py-2">
          <div className="w-1.5 h-8 bg-white rounded-none"></div>
          <div>
            <h2 className="text-2xl font-bold tracking-tighter text-white uppercase">Winners Bracket</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.5em]">Championship Path</p>
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
        <div className="sticky left-0 z-10 mb-8 flex items-center gap-3 bg-black/80 backdrop-blur-sm py-2">
          <div className="w-1.5 h-8 bg-white/40 rounded-none"></div>
          <div>
            <h2 className="text-2xl font-bold tracking-tighter text-white uppercase">Losers Bracket</h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.5em]">Redemption Path</p>
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
        group relative flex flex-col w-full rounded-none overflow-hidden border transition-all duration-200
        ${isAdmin ? "cursor-pointer hover:border-white" : "border-white/10"}
        ${isDone ? "bg-white/5" : "bg-transparent"}
      `}
      onClick={onClick}
    >
      {/* Match ID Badge */}
      <div className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 rounded-bl-lg">
        #{match.id}
      </div>

      {/* Team 1 */}
      <div className={`
        flex items-center justify-between p-3 border-b border-white/10
        ${match.winnerId === match.team1Id && match.winnerId ? "bg-white text-black" : "text-white/60"}
      `}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider`}>
            {match.team1?.name ?? "TBD"}
          </span>
        </div>
        {match.winnerId === match.team1Id && match.winnerId && (
          <span className="text-[9px] font-black uppercase">WINNER</span>
        )}
      </div>

      {/* Team 2 */}
      <div className={`
        flex items-center justify-between p-3
        ${match.winnerId === match.team2Id && match.winnerId ? "bg-white text-black" : "text-white/60"}
      `}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider`}>
            {match.team2?.name ?? "TBD"}
          </span>
        </div>
        {match.winnerId === match.team2Id && match.winnerId && (
          <span className="text-[9px] font-black uppercase">WINNER</span>
        )}
      </div>

      {/* Result Badges for Finals */}
      {match.tournamentRoundText === "W-Final" && isDone && (
        <div className="bg-white p-2 text-center border-t border-black">
          <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">
             1st Place: {match.winner?.name}
          </span>
        </div>
      )}

      {match.tournamentRoundText === "L-Final" && isDone && (
        <div className="bg-white p-2 flex justify-around border-t border-black">
          <div className="text-center">
            <p className="text-[7px] text-black/60 uppercase font-bold">2nd Place</p>
            <p className="text-[9px] font-black text-black uppercase">{match.winner?.name}</p>
          </div>
          <div className="w-px h-4 bg-black/20 self-center"></div>
          <div className="text-center">
            <p className="text-[7px] text-black/60 uppercase font-bold">3rd Place</p>
            <p className="text-[9px] font-black text-black uppercase">
              {match.winnerId === match.team1Id ? match.team2?.name : match.team1?.name}
            </p>
          </div>
        </div>
      )}

      {/* Hover Overlay for Admin */}
      {isAdmin && !isDone && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
            Set Result
          </span>
        </div>
      )}
    </div>
  );
}
