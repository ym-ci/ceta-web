"use client";

import React from "react";
import { type RouterOutputs } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

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
    // Sort rounds
    return Object.entries(rounds).sort((a, b) => {
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
          <Separator orientation="vertical" className="h-8 w-1 bg-white" />
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
          <Separator orientation="vertical" className="h-8 w-1 bg-white/40" />
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
    <Card 
      className={cn(
        "group relative flex flex-col w-full rounded-none overflow-hidden border-white/10 bg-transparent transition-all duration-200",
        isAdmin && "cursor-pointer hover:border-white/40 hover:bg-white/5",
        isDone && "bg-white/5 border-white/20"
      )}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 z-10">
        <Badge variant="outline" className="rounded-none border-none bg-white/5 text-[9px] font-mono text-white/30 px-1.5 py-0.5">
          #{match.id}
        </Badge>
      </div>

      <CardContent className="p-0">
        {/* Team 1 */}
        <div className={cn(
          "flex items-center justify-between p-3 border-b border-white/10 transition-colors",
          match.winnerId === match.team1Id && match.winnerId ? "bg-white text-black" : "text-white/60"
        )}>
          <span className="text-xs font-bold uppercase tracking-wider truncate mr-2">
            {match.team1?.name ?? "TBD"}
          </span>
          {match.winnerId === match.team1Id && match.winnerId && (
            <Badge className="bg-black text-white text-[8px] font-black rounded-none px-1 h-3.5 border-none">WINNER</Badge>
          )}
        </div>

        {/* Team 2 */}
        <div className={cn(
          "flex items-center justify-between p-3 transition-colors",
          match.winnerId === match.team2Id && match.winnerId ? "bg-white text-black" : "text-white/60"
        )}>
          <span className="text-xs font-bold uppercase tracking-wider truncate mr-2">
            {match.team2?.name ?? "TBD"}
          </span>
          {match.winnerId === match.team2Id && match.winnerId && (
            <Badge className="bg-black text-white text-[8px] font-black rounded-none px-1 h-3.5 border-none">WINNER</Badge>
          )}
        </div>

        {/* Result Badges for Finals */}
        {(match.tournamentRoundText === "W-Final" || match.tournamentRoundText === "L-Final") && isDone && (
          <div className="bg-white px-2 py-1.5 flex flex-col gap-1 border-t border-black/10">
            {match.tournamentRoundText === "W-Final" && (
              <p className="text-[9px] font-black text-black uppercase tracking-[0.1em] text-center">
                1ST: {match.winner?.name}
              </p>
            )}
            {match.tournamentRoundText === "L-Final" && (
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-[6px] text-black/40 uppercase font-black leading-none">2nd</p>
                  <p className="text-[8px] font-black text-black uppercase leading-tight">{match.winner?.name}</p>
                </div>
                <Separator orientation="vertical" className="h-4 bg-black/10" />
                <div className="text-center">
                  <p className="text-[6px] text-black/40 uppercase font-black leading-none">3rd</p>
                  <p className="text-[8px] font-black text-black uppercase leading-tight">
                    {match.winnerId === match.team1Id ? match.team2?.name : match.team1?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Hover Overlay for Admin */}
      {isAdmin && !isDone && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none flex items-center justify-center">
          <Badge variant="outline" className="opacity-0 group-hover:opacity-100 rounded-none border-white/40 text-[8px] font-black uppercase tracking-[0.2em] text-white bg-black/50 backdrop-blur-sm">
            Set Result
          </Badge>
        </div>
      )}
    </Card>
  );
}
