"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { authClient } from "~/server/better-auth/client";
import { CustomBracket } from "./CustomBracket";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { ModeToggle } from "~/components/mode-toggle";

export default function BracketPage() {
  const { data: matches, isLoading, refetch } = api.bracket.getAllMatches.useQuery();
  const updateMatchMutation = api.bracket.updateMatch.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setSelectedMatch(null);
    },
  });
  
  const { data: sessionData } = authClient.useSession();
  const isAdmin = !!sessionData?.session;

  const [mounted, setMounted] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
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
          Syncing Data
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
            The tournament bracket is empty.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild variant="default" className="w-full h-12 rounded-xl uppercase font-bold tracking-widest">
              <Link href="/">Back to Dashboard</Link>
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Tip: Run the seeder script to populate matches
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleMatchClick = (match: any) => {
    if (!isAdmin) return;
    
    if (!match.team1 || !match.team2) {
      // In a real app we'd use a Toast here
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
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-none">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">C</div>
              <span className="text-lg font-bold tracking-tight uppercase">CETA <span className="text-muted-foreground font-medium">Bracket</span></span>
            </Link>
            {isAdmin && (
              <Badge variant="outline" className="hidden sm:flex border-primary/20 text-primary bg-primary/5 rounded-full uppercase text-[10px] tracking-widest font-bold">
                Admin Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {isAdmin && (
               <Badge variant="secondary" className="sm:hidden border-none text-[8px] font-bold uppercase tracking-widest">
                 Admin
               </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden bg-muted/20">
        <div className="relative z-10 h-full">
          <CustomBracket 
            matches={matches} 
            isAdmin={isAdmin} 
            onMatchClick={handleMatchClick} 
          />
        </div>
      </main>

      {isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-3 border border-primary-foreground/20 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Tap match to update
            </p>
          </div>
        </div>
      )}

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
              onClick={() => selectedMatch && handleSetWinner(selectedMatch.team1.id)}
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
              onClick={() => selectedMatch && handleSetWinner(selectedMatch.team2.id)}
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
