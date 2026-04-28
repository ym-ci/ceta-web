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
        <Button asChild variant="outline" className="border-white px-4 py-2 uppercase tracking-widest hover:bg-white hover:text-black">
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
            <Badge variant="outline" className="rounded-none border-white/20 px-3 py-1.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Admin Active
              </span>
            </Badge>
          )}
          <nav className="flex items-center gap-6">
            <Button asChild variant="link" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white p-0 h-auto decoration-none">
              <Link href="/">Home</Link>
            </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black border border-white/20 text-white rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest font-black">Record Result</DialogTitle>
            <DialogDescription className="text-white/40 uppercase text-[10px] tracking-widest">
              Select the winner for Match #{selectedMatch?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-between h-14 rounded-none border-white/20 hover:bg-white hover:text-black uppercase font-bold tracking-widest"
              onClick={() => selectedMatch && handleSetWinner(selectedMatch.team1.id)}
              disabled={updateMatchMutation.isPending}
            >
              <span>{selectedMatch?.team1?.name}</span>
              {updateMatchMutation.isPending && <span className="animate-pulse">...</span>}
            </Button>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-[10px] font-black uppercase text-white/20">VS</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-between h-14 rounded-none border-white/20 hover:bg-white hover:text-black uppercase font-bold tracking-widest"
              onClick={() => selectedMatch && handleSetWinner(selectedMatch.team2.id)}
              disabled={updateMatchMutation.isPending}
            >
              <span>{selectedMatch?.team2?.name}</span>
              {updateMatchMutation.isPending && <span className="animate-pulse">...</span>}
            </Button>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsDialogOpen(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

