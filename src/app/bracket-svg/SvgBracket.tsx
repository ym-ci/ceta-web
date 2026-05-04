"use client";

import React, { useMemo } from "react";
import { type RouterOutputs } from "~/trpc/react";
import { cn } from "~/lib/utils";

type Match = RouterOutputs["bracket"]["getAllMatches"][number];

interface SvgBracketProps {
  matches: Match[];
  isAdmin: boolean;
  onMatchClick: (match: Match) => void;
  minimal?: boolean;
}

const COL_WIDTH = 190;
const MATCH_WIDTH = 180;
const MATCH_HEIGHT = 50;
const VERTICAL_GAP = 0;
const PADDING = 50;

export function SvgBracket({ matches, isAdmin, onMatchClick, minimal }: SvgBracketProps) {
  const layout = useMemo(() => {
    const positions: Record<number, { x: number; y: number }> = {};
    // 1. Determine k (bracket depth)
    let k = 1;
    matches.forEach(m => {
        if (!m.isLoserBracket) {
            if (m.tournamentRoundText === "W-Final") k = Math.max(k, 1);
            const rMatch = /W-R(\d+)/.exec(m.tournamentRoundText);
            if (rMatch) k = Math.max(rMatch[1] ? parseInt(rMatch[1]) + 1 : k, k);
        }
    });

    const matchRanges: Record<number, [number, number]> = {};

    // 2. Assign Ranges for Winners Bracket
    const winnersFinal = matches.find(m => !m.isLoserBracket && m.tournamentRoundText === "W-Final");
    if (winnersFinal) {
        const assignWbRange = (mId: number, start: number, end: number) => {
            matchRanges[mId] = [start, end];
            const feeders = matches
                .filter(f => f.nextMatchId === mId && !f.isLoserBracket)
                .sort((a, b) => a.id - b.id);
            
            if (feeders.length === 2) {
                assignWbRange(feeders[0]!.id, start, (start + end) / 2);
                assignWbRange(feeders[1]!.id, (start + end) / 2, end);
            } else if (feeders.length === 1) {
                // If only one feeder (bye), center it
                assignWbRange(feeders[0]!.id, start, end);
            }
        };
        assignWbRange(winnersFinal.id, 0, 1);
    }

    // 3. Assign Ranges for Losers Bracket
    const losersFinal = matches.find(m => m.tournamentRoundText === "L-Final");
    if (losersFinal) {
        const assignLbRange = (mId: number, start: number, end: number) => {
            matchRanges[mId] = [start, end];
            const lbFeeders = matches
                .filter(f => f.nextMatchId === mId && f.isLoserBracket)
                .sort((a, b) => a.id - b.id);
            
            if (lbFeeders.length === 2) {
                assignLbRange(lbFeeders[0]!.id, start, (start + end) / 2);
                assignLbRange(lbFeeders[1]!.id, (start + end) / 2, end);
            } else if (lbFeeders.length === 1) {
                assignLbRange(lbFeeders[0]!.id, start, end);
            }
        };
        assignLbRange(losersFinal.id, 0, 1);
    }

    const getX = (m: Match) => {
        const roundText = m.tournamentRoundText;
        if (!m.isLoserBracket) {
            const r = roundText === "W-Final" ? k : parseInt(/W-R(\d+)/.exec(roundText)?.[1] ?? "1");
            const col = r === 1 ? 0 : (r - 1) * 2 - 1;
            return PADDING + col * COL_WIDTH;
        } else {
            const r = roundText === "L-Final" ? 2 * k - 2 : parseInt(/L-R(\d+)/.exec(roundText)?.[1] ?? "1");
            return PADDING + r * COL_WIDTH;
        }
    };

    const wbHeight = Math.pow(2, k - 1) * (MATCH_HEIGHT + VERTICAL_GAP);
    const lbHeight = Math.pow(2, k - 2) * (MATCH_HEIGHT + VERTICAL_GAP);
    const lbOffset = wbHeight + 40;

    matches.forEach(m => {
        const range = matchRanges[m.id];
        if (range) {
            const mid = (range[0] + range[1]) / 2;
            positions[m.id] = {
                x: getX(m),
                y: PADDING + mid * (m.isLoserBracket ? lbHeight : wbHeight) + (m.isLoserBracket ? lbOffset : 0)
            };
        } else {
            // Fallback for matches not reachable from Finals (should be rare)
            const roundMatches = matches.filter(nm => nm.tournamentRoundText === m.tournamentRoundText).sort((a,b) => a.id - b.id);
            const idx = roundMatches.indexOf(m);
            positions[m.id] = {
                x: getX(m),
                y: (m.isLoserBracket ? lbOffset : PADDING) + idx * (MATCH_HEIGHT + VERTICAL_GAP) * 2
            };
        }
    });


    // Normalize positions to remove empty space at top/left
    const minPosX = Object.values(positions).reduce((min, p) => Math.min(min, p.x), Infinity);
    const minPosY = Object.values(positions).reduce((min, p) => Math.min(min, p.y), Infinity);
    
    if (minPosX !== Infinity && minPosY !== Infinity) {
        Object.values(positions).forEach(p => {
            p.x = p.x - minPosX + PADDING;
            p.y = p.y - minPosY + PADDING;
        });
    }

    const maxPosX = Object.values(positions).reduce((max, p) => Math.max(max, p.x), 0);
    const maxPosY = Object.values(positions).reduce((max, p) => Math.max(max, p.y), 0);

    return { positions, k, maxPosX, maxPosY };
  }, [matches]);

  const { positions, k, maxPosX, maxPosY } = layout;

  // Calculate SVG bounds based on actual content
  const width = maxPosX + MATCH_WIDTH + PADDING;
  const height = maxPosY + MATCH_HEIGHT + PADDING;

  return (
    <div className={cn(
        "w-full h-full overflow-auto relative",
        !minimal && "bg-background/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-2xl"
    )}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="touch-none select-none"
      >
        <defs>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.645 0.246 16.439)" />
            <stop offset="100%" stopColor="oklch(0.645 0.246 16.439 / 0.8)" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.588 0.158 241.966)" />
            <stop offset="100%" stopColor="oklch(0.588 0.158 241.966 / 0.8)" />
          </linearGradient>
          <clipPath id="matchClip">
            <rect width={MATCH_WIDTH} height={MATCH_HEIGHT} rx="12" />
          </clipPath>
        </defs>

        {/* Connectors */}
        {matches.map((m) => {
          const start = positions[m.id];
          if (!start) return null;

          const nextMatch = matches.find((nm) => nm.id === m.nextMatchId);
          const nextPos = nextMatch ? positions[nextMatch.id] : null;

          const loserMatch = matches.find((nm) => nm.id === m.nextLooserMatchId);
          const loserPos = loserMatch ? positions[loserMatch.id] : null;

          return (
            <React.Fragment key={`conn-${m.id}`}>
              {nextPos && (
                <path
                  d={`M ${start.x + MATCH_WIDTH} ${start.y + MATCH_HEIGHT / 2} L ${nextPos.x} ${nextPos.y + MATCH_HEIGHT / 2}`}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="2"
                  strokeDasharray={m.state === "DONE" ? "0" : "4 4"}
                  className="transition-all duration-500"
                />
              )}
              {/* {loserPos && (
                <path
                  d={`M ${start.x + MATCH_WIDTH} ${start.y + MATCH_HEIGHT / 2} L ${loserPos.x} ${loserPos.y + MATCH_HEIGHT / 2}`}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  opacity="0.4"
                  strokeDasharray="2 2"
                />
              )} */}
            </React.Fragment>
          );
        })}

        {/* Matches */}
        {matches.map((m) => {
          const pos = positions[m.id];
          if (!pos) return null;

          const isDone = m.state === "DONE";

          return (
            <g
              key={m.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={cn(
                "cursor-pointer group transition-transform hover:scale-[1.02]",
                !isAdmin && "pointer-events-none"
              )}
              onClick={() => onMatchClick(m)}
              clipPath="url(#matchClip)"
            >
              {/* Card Background */}
              <rect
                width={MATCH_WIDTH}
                height={MATCH_HEIGHT}
                rx="12"
                fill="var(--card)"
                stroke={isDone ? "var(--primary)" : "var(--border)"}
                strokeWidth={isDone ? "2" : "1"}
                className="transition-all shadow-sm group-hover:shadow-md"
              />

              {/* Match Header (ID) */}
              <text
                x={MATCH_WIDTH - 6}
                y={12}
                textAnchor="end"
                className="text-[8px] font-bold fill-muted-foreground opacity-30 uppercase tracking-widest"
              >
                #{m.id}
              </text>
              <text
                x={6}
                y={12}
                className="text-[8px] font-black fill-muted-foreground uppercase tracking-tighter"
              >
                {m.tournamentRoundText}
              </text>

              {/* Team 1 Row */}
              <g transform="translate(0, 15)">
                <rect
                  width={MATCH_WIDTH}
                  height={17}
                  fill={m.winnerId === m.team1Id && m.winnerId ? "var(--primary)" : "transparent"}
                  className="transition-colors"
                />
                <rect width={3} height={17} fill="oklch(0.645 0.246 16.439)" />
                <text
                  x={10}
                  y={12}
                  className={cn(
                    "text-[10px] font-bold tracking-tight uppercase",
                    m.winnerId === m.team1Id && m.winnerId ? "fill-primary-foreground" : "fill-foreground",
                    m.winnerId && m.winnerId !== m.team1Id && "opacity-30"
                  )}
                >
                  {m.team1?.name ?? "TBD"}
                </text>
              </g>

              {/* Team 2 Row */}
              <g transform="translate(0, 32)">
                <rect
                  width={MATCH_WIDTH}
                  height={17}
                  fill={m.winnerId === m.team2Id && m.winnerId ? "var(--primary)" : "transparent"}
                  className="transition-colors"
                />
                <rect width={3} height={17} fill="oklch(0.588 0.158 241.966)" />
                <text
                  x={10}
                  y={12}
                  className={cn(
                    "text-[10px] font-bold tracking-tight uppercase",
                    m.winnerId === m.team2Id && m.winnerId ? "fill-primary-foreground" : "fill-foreground",
                    m.winnerId && m.winnerId !== m.team2Id && "opacity-30"
                  )}
                >
                  {m.team2?.name ?? "TBD"}
                </text>
              </g>

              {/* Series Status */}
              {isDone && (
                <text
                  x={MATCH_WIDTH / 2}
                  y={MATCH_HEIGHT + 8}
                  textAnchor="middle"
                  className="text-[6px] font-black fill-primary uppercase tracking-[0.1em]"
                >
                  DONE
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
