"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { SvgBracket } from "../SvgBracket";

function BracketEmbedContent() {
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get("challenge");
  const challenge = (challengeParam === "iot" || challengeParam === "bucket") ? challengeParam : "fairway";

  const { data: matches, isLoading } = api.bracket.getAllMatches.useQuery({ challenge }, { refetchInterval: 5000 });
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
        minimal={true}
        onMatchClick={() => {return}}
      />
    </div>
  );
}

export default function BracketEmbedPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <div className="h-8 w-8 rounded-full border-t-2 border-primary animate-spin" />
      </div>
    }>
      <BracketEmbedContent />
    </Suspense>
  );
}
