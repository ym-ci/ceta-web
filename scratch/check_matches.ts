import { db } from "../src/server/db/index";
import { match } from "../src/server/db/schema";
import { asc } from "drizzle-orm";

async function checkMatches() {
  const matches = await db.query.match.findMany({
    orderBy: [asc(match.id)]
  });

  matches.forEach(m => {
    console.log(`ID: ${m.id} | Round: ${m.tournamentRoundText.padEnd(8)} | LB: ${m.isLoserBracket}`);
  });
  
  process.exit(0);
}

checkMatches();
