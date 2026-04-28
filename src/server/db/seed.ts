import { db } from "./index";
import { team, match } from "./schema";

const defaultTeamNames = ["Haig Robotics A", "Haig Robotics B", "Moody Robot", "Savage", "Cooked Cornball", "Little Jeremy", "Good Bot", "Devious Birds", "Hatchlings", "SATEC 1", "W.A.rriors", "3 Musketeers", "The Bethlings", "Chorgirand the sesame seed", "Hamer", "TigerBots", "YM Zipties"]

async function seed(customNames?: string[]) {
  const teamNames = customNames && customNames.length > 0 ? customNames : defaultTeamNames;
  
  console.log(`Seeding database with ${teamNames.length} teams...`);

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(match);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(team);

  // Insert teams
  const insertedTeams = await db.insert(team).values(
    teamNames.map(name => ({ name }))
  ).returning();

  console.log(`Inserted ${insertedTeams.length} teams`);

  // Shuffle teams for random seeding
  const shuffledTeams = shuffleArray([...insertedTeams]);

  // Auto-generate matches for a double elimination bracket
  const matchesToInsert = generateBracket(shuffledTeams);

  await db.insert(match).values(matchesToInsert);
  
  console.log(`Seeded ${matchesToInsert.length} matches successfully!`);
  process.exit(0);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}


type MatchInsert = typeof match.$inferInsert;

function getSeeding(n: number): number[] {
  let seeding = [1];
  while (seeding.length < n) {
    const nextSeeding = [];
    const len = seeding.length;
    for (const s of seeding) {
      nextSeeding.push(s);
      nextSeeding.push(2 * len + 1 - s);
    }
    seeding = nextSeeding;
  }
  return seeding;
}

function generateBracket(insertedTeams: { id: number }[]) {
  const n = insertedTeams.length;
  if (n === 0) return [];

  // Round up to nearest power of 2 for the bracket structure
  const k = Math.ceil(Math.log2(n));
  const bracketSize = Math.pow(2, k);
  
  // Standard tournament seeding (e.g., 1 vs 16, 8 vs 9, etc.)
  const seeding = getSeeding(bracketSize);
  
  const matches: MatchInsert[] = [];
  let currentMatchId = 1;

  // Winners Bracket (WB)
  const wb: MatchInsert[][] = [];
  for (let r = 0; r < k; r++) {
    const numMatchesInRound = bracketSize / Math.pow(2, r + 1);
    const roundMatches: MatchInsert[] = [];
    for (let m = 0; m < numMatchesInRound; m++) {
      const matchObj: MatchInsert = {
        id: currentMatchId++,
        tournamentRoundText: r === k - 1 ? "W-Final" : `W-R${r + 1}`,
        state: "SCHEDULED",
        isLoserBracket: false,
        team1Id: null,
        team2Id: null,
        nextMatchId: null,
        nextLooserMatchId: null,
      };
      
      // Seed teams into the first round using tournament seeding
      if (r === 0) {
        const seed1 = seeding[m * 2];
        const seed2 = seeding[m * 2 + 1];
        
        // Seed numbers are 1-indexed, insertedTeams is 0-indexed
        if (seed1 !== undefined) {
          matchObj.team1Id = insertedTeams[seed1 - 1]?.id ?? null;
        }
        if (seed2 !== undefined) {
          matchObj.team2Id = insertedTeams[seed2 - 1]?.id ?? null;
        }
      }
      
      roundMatches.push(matchObj);
      matches.push(matchObj);
    }
    wb.push(roundMatches);
  }

  // Losers Bracket (LB)
  // Total LB rounds = 2k - 2
  const lb: MatchInsert[][] = [];
  for (let r = 0; r < 2 * k - 2; r++) {
    const numMatchesInRound = Math.pow(2, k - 2 - Math.floor(r / 2));
    const roundMatches: MatchInsert[] = [];
    for (let m = 0; m < numMatchesInRound; m++) {
      const isFinal = r === 2 * k - 3;
      const matchObj: MatchInsert = {
        id: currentMatchId++,
        tournamentRoundText: isFinal ? "L-Final" : `L-R${r + 1}`,
        state: "SCHEDULED",
        isLoserBracket: true,
        team1Id: null,
        team2Id: null,
        nextMatchId: null,
        nextLooserMatchId: null,
      };
      roundMatches.push(matchObj);
      matches.push(matchObj);
    }
    lb.push(roundMatches);
  }

  // --- CONNECT MATCHES ---

  // Connect WB to next WB matches and LB matches
  for (let r = 0; r < k - 1; r++) {
    const currentRound = wb[r];
    const nextRound = wb[r + 1];
    if (!currentRound || !nextRound) continue;

    for (let m = 0; m < currentRound.length; m++) {
      const match = currentRound[m];
      if (!match) continue;

      // Next WB match
      const nextWBIdx = Math.floor(m / 2);
      match.nextMatchId = nextRound[nextWBIdx]?.id ?? null;

      // Next LB match for the loser
      if (r === 0) {
        // Losers of WB R1 go to LB R1
        const lbIdx = Math.floor(m / 2);
        match.nextLooserMatchId = lb[0]?.[lbIdx]?.id ?? null;
      } else {
        // Losers of WB R(r+1) go to LB R(2r)
        const lbRoundIdx = 2 * r - 1;
        match.nextLooserMatchId = lb[lbRoundIdx]?.[m]?.id ?? null;
      }
    }
  }

  // Winners Final loser goes to Losers Final
  if (k > 0) {
    const winnersFinal = wb[k - 1]?.[0];
    const losersFinal = lb[2 * k - 3]?.[0];
    if (winnersFinal && losersFinal) {
      winnersFinal.nextLooserMatchId = losersFinal.id;
    }
  }

  // Connect LB matches
  for (let r = 0; r < lb.length - 1; r++) {
    const currentRound = lb[r];
    const nextRound = lb[r + 1];
    if (!currentRound || !nextRound) continue;

    for (let m = 0; m < currentRound.length; m++) {
      const match = currentRound[m];
      if (!match) continue;

      if (r % 2 === 0) {
        // Odd LB Round (indexed 0, 2, ...) -> same number of matches in next LB round
        match.nextMatchId = nextRound[m]?.id ?? null;
      } else {
        // Even LB Round (indexed 1, 3, ...) -> half the number of matches in next LB round
        const nextLBIdx = Math.floor(m / 2);
        match.nextMatchId = nextRound[nextLBIdx]?.id ?? null;
      }
    }
  }

  // --- CULL BYES ---
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i]!;
      
      // A match is a bye or empty if it can never have more than 1 team.
      // This happens if (teams already seeded) + (matches pointing to this match) <= 1.
      const feeders = matches.filter(other => 
        other.nextMatchId === m.id || other.nextLooserMatchId === m.id
      );
      const teamCount = (m.team1Id !== null ? 1 : 0) + (m.team2Id !== null ? 1 : 0);
      
      if (teamCount + feeders.length <= 1) {
        const teamId = m.team1Id ?? m.team2Id;
        
        // 1. If there's a team, advance it to the next match
        if (teamId && m.nextMatchId) {
          const nextM = matches.find(nm => nm.id === m.nextMatchId);
          if (nextM) {
            if (nextM.team1Id === null) {
              nextM.team1Id = teamId;
            } else if (nextM.team2Id === null) {
              nextM.team2Id = teamId;
            }
          }
        }
        
        // 2. Redirect all feeders to point to the next match
        for (const feeder of feeders) {
          if (feeder.nextMatchId === m.id) {
            feeder.nextMatchId = m.nextMatchId;
          }
          if (feeder.nextLooserMatchId === m.id) {
            feeder.nextLooserMatchId = m.nextMatchId;
          }
        }
        
        // 3. Remove the match
        matches.splice(i, 1);
        changed = true;
        break; // Start over after modification
      }
    }
  }

  return matches;
}




// Get arguments from command line
const args = process.argv.slice(2);
let inputNames: string[] = [];

if (args.length > 0) {
  // If the first argument contains a comma, assume it's a comma-separated list
  if (args.length === 1 && args[0]?.includes(",")) {
    inputNames = args[0].split(",").map(n => n.trim()).filter(n => n !== "");
  } else {
    // Otherwise use the arguments as the list
    inputNames = args;
  }
}

seed(inputNames).catch((e) => {
  console.error("Seeding failed:");
  console.error(e);
  process.exit(1);
});

