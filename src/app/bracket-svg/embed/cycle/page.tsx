"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { SvgBracket } from "../../SvgBracket";
import { cn } from "~/lib/utils";

const CYCLE_TIME = 10000; // Time each bracket is shown (15s)
const FADE_TIME = 750;   // Duration of the fade animation (1s)

export default function CycleBracketEmbedPage() {
  const { data: matches, isLoading } = api.bracket.getAllMatches.useQuery({}, { refetchInterval: 5000 });
  const [mounted, setMounted] = useState(false);
  const [bracketType, setBracketType] = useState<"upper" | "lower">("upper");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const cycle = async () => {
      // 1. Wait for the show time
      await new Promise(resolve => setTimeout(resolve, CYCLE_TIME));
      
      // 2. Fade out
      setIsVisible(false);
      
      // 3. Wait for fade out to complete
      await new Promise(resolve => setTimeout(resolve, FADE_TIME));
      
      // 4. Switch bracket type
      setBracketType(prev => prev === "upper" ? "lower" : "upper");
      
      // 5. Fade in
      setIsVisible(true);
      
      // 6. Recurse
      void cycle();
      
    };

    const timeout = setTimeout(() => {
      void cycle();
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <div className="h-8 w-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return null;
  }

  return (
    <div className="h-screen w-screen bg-transparent flex items-center justify-center overflow-hidden">
      <div 
        className={cn(
          "w-full h-full transition-opacity ease-in-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${FADE_TIME}ms` }}
      >
        <SvgBracket 
          matches={matches} 
          isAdmin={false} 
          minimal={true}
          onMatchClick={() => {return}} 
          bracketType={bracketType}
        />
      </div>
    </div>
  );
}
