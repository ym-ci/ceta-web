"use client";

import React, { useState, useEffect } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import Link from "next/link";
import { authClient } from "~/server/better-auth/client";
import { SvgBracket } from "./SvgBracket";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { ModeToggle } from "~/components/mode-toggle";

type Match = RouterOutputs["bracket"]["getAllMatches"][number];

export default function BracketSvgPage() {
  const challengeOptions = [
    { id: "fairway" as const, label: "Running the Fairway" },
    { id: "iot" as const, label: "IoT & Collision avoidance" },
    { id: "bucket" as const, label: "Bucket Challenge" },
  ];
  type ChallengeId = (typeof challengeOptions)[number]["id"];

  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeId>("fairway");
  const selectedChallengeLabel = challengeOptions.find((c) => c.id === selectedChallenge)?.label ?? "Selected Challenge";

  const { data: matches, isLoading, refetch } = api.bracket.getAllMatches.useQuery({ challenge: selectedChallenge }, { refetchInterval: 5000 });
  const updateMatchMutation = api.bracket.updateMatch.useMutation({
    onSuccess: () => {
      void refetch();
      setIsDialogOpen(false);
      setSelectedMatch(null);
    },
  });
  
  const { data: sessionData } = authClient.useSession();
  const isAdmin = !!sessionData?.session;

  const [mounted, setMounted] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-2 border-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-16 w-16 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
        <div className="mt-8 text-[10px] font-black uppercase tracking-[0.8em] text-muted-foreground animate-pulse">
          Generating SVG Canvas
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-8">
        <div className="w-full max-w-md bg-card border border-border p-12 rounded-3xl text-center shadow-xl">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight uppercase mb-2">No Matches Found</h2>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mb-8">
            No matches found for {selectedChallengeLabel}.
          </p>
          <Button asChild variant="default" className="w-full h-12 rounded-xl uppercase font-bold tracking-widest">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleMatchClick = (match: Match) => {
    if (!isAdmin) return;
    if (!match.team1 || !match.team2) {
      alert("Cannot complete match: Both teams must be determined first.");
      return;
    }
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const handleSetWinner = (winnerId: number) => {
    if (!selectedMatch) return;
    updateMatchMutation.mutate({
      matchId: selectedMatch.id,
      winnerId: winnerId,
      state: "DONE",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex flex-col gap-3 px-4 md:px-8 max-w-none py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">C</div>
                <span className="text-lg font-bold tracking-tight uppercase">CETA <span className="text-muted-foreground font-medium text-xs">SVG</span></span>
              </Link>
              <div className="h-4 w-px bg-border mx-2" />
              <Link href="/bracket" className="text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground transition-colors tracking-widest">
                  Classic View
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              {isAdmin && (
                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 rounded-full uppercase text-[10px] tracking-widest font-bold">
                  Admin
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {challengeOptions.map((challenge) => (
              <button
                key={challenge.id}
                type="button"
                className={cn(
                  "rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] transition-all duration-200",
                  selectedChallenge === challenge.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                onClick={() => setSelectedChallenge(challenge.id)}
              >
                {challenge.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden bg-muted/10 p-4 md:p-8">
        <SvgBracket 
            matches={matches} 
            isAdmin={isAdmin} 
            onMatchClick={handleMatchClick} 
        />
      </main>

      {/* Admin Quick Action */}
      {isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-primary-foreground/20 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">
              Select a match to update results
            </p>
          </div>
        </div>
      )}

      {/* Record Result Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border border-border text-foreground rounded-2xl sm:max-w-[400px] shadow-2xl p-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-2xl font-bold tracking-tight uppercase">Record Result</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
              Match #{selectedMatch?.id} Outcome
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <Button 
              variant="outline" 
              className="w-full justify-between h-16 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all group px-4"
              onClick={() => selectedMatch?.team1 && handleSetWinner(selectedMatch.team1.id)}
              disabled={updateMatchMutation.isPending}
            >
              <span className="font-bold tracking-tight uppercase text-base">{selectedMatch?.team1?.name}</span>
              {updateMatchMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="h-6 w-6 rounded-full border border-border group-hover:border-primary/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-primary">1</div>
              )}
            </Button>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3 text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">VS</span>
            </div>

            <Button 
              variant="outline" 
              className="w-full justify-between h-16 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all group px-4"
              onClick={() => selectedMatch?.team2 && handleSetWinner(selectedMatch.team2.id)}
              disabled={updateMatchMutation.isPending}
            >
              <span className="font-bold tracking-tight uppercase text-base">{selectedMatch?.team2?.name}</span>
              {updateMatchMutation.isPending ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="h-6 w-6 rounded-full border border-border group-hover:border-primary/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-primary">2</div>
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsDialogOpen(false)}
              className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
