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
    // Sort rounds dynamically
    return Object.entries(rounds).sort((a, b) => {
        const roundA = a[0];
        const roundB = b[0];

        // Finals always go last
        if (roundA.includes("-Final")) return 1;
        if (roundB.includes("-Final")) return -1;

        // Extract the round number (e.g., "W-R1" -> 1)
        const matchA = /R(\d+)/.exec(roundA);
        const matchB = /R(\d+)/.exec(roundB);
        
        const numA = matchA ? parseInt(matchA[1]!) : 0;
        const numB = matchB ? parseInt(matchB[1]!) : 0;

        return numA - numB;
    });
  };

  const winnersRounds = groupByRound(winnersMatches);
  const losersRounds = groupByRound(losersMatches);

  return (
    <div className="flex flex-col gap-16 p-8 md:p-12 overflow-auto h-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted transition-all">
      {/* Winners Bracket */}
      <section className="relative">
        <div className="sticky left-0 z-10 mb-8 flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-primary" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase">Winners Bracket</h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Championship Path</p>
          </div>
        </div>
        <div className="flex gap-12 items-start pb-4">
          {winnersRounds.map(([roundName, roundMatches]) => (
            <div key={roundName} className="flex flex-col gap-6 min-w-[280px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-2 px-2 flex items-center gap-2">
                <span className="h-px w-4 bg-muted-foreground/20" />
                {roundName}
              </div>
              <div className="flex flex-col justify-around h-full gap-8">
                {roundMatches.sort((a,b) => a.id - b.id).map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isAdmin={isAdmin} 
                    allMatches={matches}
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
        <div className="sticky left-0 z-10 mb-8 flex items-center gap-4">
          <div className="h-10 w-1 rounded-full bg-muted-foreground/40" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase">Losers Bracket</h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Redemption Path</p>
          </div>
        </div>
        <div className="flex gap-12 items-start pb-4">
          {losersRounds.map(([roundName, roundMatches]) => (
            <div key={roundName} className="flex flex-col gap-6 min-w-[280px]">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-2 px-2 flex items-center gap-2">
                <span className="h-px w-4 bg-muted-foreground/20" />
                {roundName}
              </div>
              <div className="flex flex-col justify-around h-full gap-8">
                {roundMatches.sort((a,b) => a.id - b.id).map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isAdmin={isAdmin} 
                    allMatches={matches}
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

function MatchCard({ 
  match, 
  isAdmin, 
  allMatches,
  onClick 
}: { 
  match: Match; 
  isAdmin: boolean; 
  allMatches: Match[];
  onClick: () => void 
}) {
  const isDone = match.state === "DONE";

  const renderTeamName = (teamId: number | null, team: { name: string } | null, teamIndex: 1 | 2) => {
    if (team) return team.name;
    
    // Find feeders for this match
    const feeders = allMatches.filter(
      (m) => m.nextMatchId === match.id || m.nextLooserMatchId === match.id
    );
    
    // Sort by ID to match seeding order
    feeders.sort((a, b) => a.id - b.id);
    
    let feeder: Match | undefined;
    if (teamIndex === 1) {
      feeder = feeders[0];
    } else {
      // If team1 is set, then the first feeder must be for team2
      feeder = match.team1Id ? feeders[0] : feeders[1];
    }

    if (!feeder) return "TBD";

    const isWinnerFeeder = feeder.nextMatchId === match.id;
    const label = isWinnerFeeder ? "Winner" : "Loser";
    const colorClass = isWinnerFeeder ? "text-green-500" : "text-red-500";

    return (
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <span className={cn("font-black tracking-tighter uppercase text-[10px]", colorClass)}>
          {label}
        </span>
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
          of {feeder.tournamentRoundText} #{feeder.id}
        </span>
      </span>
    );
  };
  
  return (
    <Card 
      className={cn(
        "group relative flex flex-col w-full rounded-xl overflow-hidden border-border bg-card/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20",
        isAdmin && "cursor-pointer active:scale-[0.98]",
        isDone && "bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className="absolute top-2 right-2 z-10">
        <Badge variant="secondary" className="rounded-full bg-background/50 backdrop-blur-sm text-[8px] font-mono text-muted-foreground px-2 py-0 border-none">
          #{match.id}
        </Badge>
      </div>

      <CardContent className="p-0">
        {/* Team 1 */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3.5 border-b border-border transition-colors",
          match.winnerId === match.team1Id && match.winnerId ? "bg-primary text-primary-foreground" : "text-foreground"
        )}>
          <div className={cn(
            "text-sm font-semibold uppercase tracking-tight truncate mr-2 flex items-center",
            match.winnerId && match.winnerId !== match.team1Id && "opacity-40"
          )}>
            {renderTeamName(match.team1Id, match.team1, 1)}
          </div>
          {match.winnerId === match.team1Id && match.winnerId && (
            <Badge className="bg-primary-foreground text-primary text-[8px] font-black rounded-full px-2 h-4 border-none">WINNER</Badge>
          )}
        </div>

        {/* Team 2 */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3.5 transition-colors",
          match.winnerId === match.team2Id && match.winnerId ? "bg-primary text-primary-foreground" : "text-foreground"
        )}>
          <div className={cn(
            "text-sm font-semibold uppercase tracking-tight truncate mr-2 flex items-center",
            match.winnerId && match.winnerId !== match.team2Id && "opacity-40"
          )}>
            {renderTeamName(match.team2Id, match.team2, 2)}
          </div>
          {match.winnerId === match.team2Id && match.winnerId && (
            <Badge className="bg-primary-foreground text-primary text-[8px] font-black rounded-full px-2 h-4 border-none">WINNER</Badge>
          )}
        </div>

        {/* Result Badges for Finals */}
        {(match.tournamentRoundText === "W-Final" || match.tournamentRoundText === "L-Final") && isDone && (
          <div className="bg-primary/10 px-3 py-3 flex flex-col gap-1 border-t border-primary/20">
            {match.tournamentRoundText === "W-Final" && (
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-1">Champion</span>
                <p className="text-xs font-black text-primary uppercase tracking-wider text-center">
                  {match.winner?.name}
                </p>
              </div>
            )}
            {match.tournamentRoundText === "L-Final" && (
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-[8px] text-primary/60 uppercase font-black leading-none mb-1">2nd</p>
                  <p className="text-[10px] font-black text-primary uppercase leading-tight">{match.winner?.name}</p>
                </div>
                <Separator orientation="vertical" className="h-6 bg-primary/20" />
                <div className="text-center">
                  <p className="text-[8px] text-primary/60 uppercase font-black leading-none mb-1">3rd</p>
                  <p className="text-[10px] font-black text-primary uppercase leading-tight">
                    {match.winnerId === match.team1Id ? match.team2?.name : match.team1?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

