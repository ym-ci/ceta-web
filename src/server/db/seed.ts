import { db } from "./index";
import { team, match } from "./schema";

const defaultTeamNames = ["Haig Robotics A", "Haig Robotics B", "Moody Robot", "Savage", "Cooked Cornball", "Little Jeremy", "Good Bot", "Devious Birds", "Hatchlings", "SATEC 1", "W.A.rriors", "3 Musketeers", "The Bethlings", "Chorgirand the sesame seed", "Hamer", "TigerBots", "YM Zipties"];

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

  // Determine the bracket structure
  const fullK = Math.ceil(Math.log2(n)); // Rounds for a full bracket with n teams
  const largestPowerOf2 = Math.pow(2, fullK - 1); // Largest power of 2 <= n
  const seedingRounds = Math.log2(largestPowerOf2); // Rounds needed for the seeding bracket
  const r1Matches = largestPowerOf2 / 2; // Matches in round 1
  const actualK = Math.log2(r1Matches) + 1; // Actual rounds needed for the bracket structure
  const byeTeamsCount = n - largestPowerOf2; // Teams that get byes to R2

  console.log(`\n=== Bracket Generation ===`);
  console.log(`Teams count: ${n}`);
  console.log(`Largest power of 2 <= n: ${largestPowerOf2}`);
  console.log(`Round 1 matches: ${r1Matches}`);
  console.log(`Actual rounds needed: ${actualK}`);
  console.log(`Bye teams: ${byeTeamsCount}`);

  // Get seeding for the largest power of 2 that's <= n
  const seeding = getSeeding(largestPowerOf2);
  
  // Track bye teams (seeds after largestPowerOf2)
  const byeTeams: { seedNum: number; teamId: number }[] = [];
  for (let i = largestPowerOf2; i < n; i++) {
    byeTeams.push({
      seedNum: i + 1,
      teamId: insertedTeams[i]?.id ?? 0,
    });
  }
  
  if (byeTeamsCount > 0) {
    console.log(`\nBye team seeds: ${byeTeams.map(t => t.seedNum).join(", ")}`);
  }

  const matches: MatchInsert[] = [];
  let currentMatchId = 1;

  // Winners Bracket (WB)
  const wb: MatchInsert[][] = [];
  for (let r = 0; r < actualK; r++) {
    const numMatchesInRound = Math.pow(2, Math.log2(r1Matches) - r);
    console.log(`\nWB Round ${r + 1}: ${numMatchesInRound} matches`);
    
    const roundMatches: MatchInsert[] = [];
    for (let m = 0; m < numMatchesInRound; m++) {
      const matchObj: MatchInsert = {
        id: currentMatchId++,
        tournamentRoundText: r === actualK - 1 ? "W-Final" : `W-R${r + 1}`,
        state: "SCHEDULED",
        isLoserBracket: false,
        team1Id: null,
        team2Id: null,
        nextMatchId: null,
        nextLooserMatchId: null,
      };

      // For round 1, seed teams from the seeding array
      if (r === 0) {
        const seed1 = seeding[m * 2];
        const seed2 = seeding[m * 2 + 1];

        // Team indices are 0-based
        if (seed1 !== undefined && seed1 - 1 < n) {
          matchObj.team1Id = insertedTeams[seed1 - 1]?.id ?? null;
        }
        if (seed2 !== undefined && seed2 - 1 < n) {
          matchObj.team2Id = insertedTeams[seed2 - 1]?.id ?? null;
        }

        console.log(`  Match ${m + 1}: Seed ${seed1} (Team ID: ${matchObj.team1Id}) vs Seed ${seed2} (Team ID: ${matchObj.team2Id})`);
      }
      // For round 2, place bye teams in the last match slots
      else if (r === 1) {
        if (byeTeamsCount > 0 && m >= numMatchesInRound - byeTeamsCount) {
          const byeIdx = m - (numMatchesInRound - byeTeamsCount);
          if (byeTeams[byeIdx]) {
            matchObj.team2Id = byeTeams[byeIdx].teamId;
            console.log(`  Match ${m + 1}: (Winner from R1) vs Seed ${byeTeams[byeIdx].seedNum} (Team ID: ${matchObj.team2Id}) [BYE]`);
          }
        } else {
          console.log(`  Match ${m + 1}: (Winners from R1 Match ${m + 1} & ${m + 2})`);
        }
      }

      roundMatches.push(matchObj);
      matches.push(matchObj);
    }
    wb.push(roundMatches);
  }

  // Losers Bracket (LB)
  // Total LB rounds = 2*actualK - 2
  const lb: MatchInsert[][] = [];
  const lbRounds = 2 * actualK - 2;
  for (let r = 0; r < lbRounds; r++) {
    const numMatchesInRound = Math.pow(2, Math.log2(r1Matches) - 1 - Math.floor(r / 2));
    console.log(`LB Round ${r + 1}: ${numMatchesInRound} matches`);
    const roundMatches: MatchInsert[] = [];
    for (let m = 0; m < numMatchesInRound; m++) {
      const isFinal = r === lbRounds - 1;
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
  for (let r = 0; r < actualK - 1; r++) {
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
  if (actualK > 0) {
    const winnersFinal = wb[actualK - 1]?.[0];
    const losersFinal = lb[lbRounds - 1]?.[0];
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

  console.log(`\n=== Bracket Summary ===`);
  console.log(`Total matches created: ${matches.length}`);
  console.log(`Winners bracket rounds: ${wb.length}`);
  console.log(`Losers bracket rounds: ${lb.length}`);
  console.log(`================================\n`);

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

