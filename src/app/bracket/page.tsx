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
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-sm font-bold uppercase tracking-[0.5em]">Loading</div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground flex-col gap-6">
        <div className="text-sm font-bold uppercase tracking-[0.3em]">No Data Found</div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest">Please run the seeder script.</p>
        <Button asChild variant="outline" className="border-foreground px-4 py-2 uppercase tracking-widest">
          <Link href="/">Return Home</Link>
        </Button>
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
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col font-sans relative">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <main className="flex-1 relative overflow-hidden bg-background">
        <div className="relative z-10 h-full">
          <CustomBracket 
            matches={matches} 
            isAdmin={isAdmin} 
            onMatchClick={handleMatchClick} 
          />
        </div>
      </main>

      {isAdmin && (
        <footer className="p-2 bg-foreground text-background text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Admin Mode: Click match to record outcome
          </p>
        </footer>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border border-foreground/20 text-foreground rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest font-black">Record Result</DialogTitle>
            <DialogDescription className="text-foreground/40 uppercase text-[10px] tracking-widest">
              Select the winner for Match #{selectedMatch?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-between h-14 rounded-none border-foreground/20 uppercase font-bold tracking-widest"
              onClick={() => selectedMatch && handleSetWinner(selectedMatch.team1.id)}
              disabled={updateMatchMutation.isPending}
            >
              <span>{selectedMatch?.team1?.name}</span>
              {updateMatchMutation.isPending && <span>...</span>}
            </Button>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-foreground/10"></div>
              <span className="text-[10px] font-black uppercase text-foreground/20">VS</span>
              <div className="h-px flex-1 bg-foreground/10"></div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-between h-14 rounded-none border-foreground/20 uppercase font-bold tracking-widest"
              onClick={() => selectedMatch && handleSetWinner(selectedMatch.team2.id)}
              disabled={updateMatchMutation.isPending}
            >
              <span>{selectedMatch?.team2?.name}</span>
              {updateMatchMutation.isPending && <span>...</span>}
            </Button>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsDialogOpen(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-foreground/40"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
