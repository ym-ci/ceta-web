"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { SvgBracket } from "../../SvgBracket";

export default function LowerBracketEmbedPage() {
  const { data: matches, isLoading } = api.bracket.getAllMatches.useQuery();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <div className="h-screen w-screen bg-transparent">
      <SvgBracket 
        matches={matches} 
        isAdmin={false} 
        onMatchClick={() => {}} 
        minimal={true}
        bracketType="lower"
      />
    </div>
  );
}
