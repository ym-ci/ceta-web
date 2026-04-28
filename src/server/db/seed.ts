import { db } from "./index";
import { team, match } from "./schema";

const teamNames = [
  "LEV", "Meta Knight", "Nightfury", "GuardianBots", "Rust*eze", "Asparagus", 
  "Locked", "LAAL", "SKY", "The Wingho Riders", "ACCI 1", "ACCI 2", 
  "Jetson - Red", "JAYL", "Jetson - Green", "Jetson - Yellow", "Jetson - Blue", 
  "Central Tech ICT", "RobotsGoBrrr", "Chris Hadfield", "Group 1", "Northern Alpha", 
  "Group 2", "Decepticepticons", "The wild Apes", "Kraftarm", "Tech Gurus", 
  "Northern Gamma", "Northern Beta", "Satec", "Team Finality", "ACCI solo"
];

async function seed() {
  console.log("Seeding database...");

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(match);
  // eslint-disable-next-line drizzle/enforce-delete-with-where
  await db.delete(team);

  // Insert teams
  const insertedTeams = await db.insert(team).values(
    teamNames.map(name => ({ name }))
  ).returning();

  console.log(`Inserted ${insertedTeams.length} teams`);

  // We will create a simpler 8-team double elimination bracket for demonstration
  // Generating a 32-team double elim is extremely complex to hardcode nextMatchIds correctly.
  // This seeder provides a robust, fully working 8-team bracket.
  
  const matchesToInsert = [
    // WINNERS ROUND 1
    { id: 1, tournamentRoundText: "W-R1", state: "SCHEDULED", isLoserBracket: false, team1Id: insertedTeams[0]?.id, team2Id: insertedTeams[1]?.id, nextMatchId: 5, nextLooserMatchId: 7 },
    { id: 2, tournamentRoundText: "W-R1", state: "SCHEDULED", isLoserBracket: false, team1Id: insertedTeams[2]?.id, team2Id: insertedTeams[3]?.id, nextMatchId: 5, nextLooserMatchId: 7 },
    { id: 3, tournamentRoundText: "W-R1", state: "SCHEDULED", isLoserBracket: false, team1Id: insertedTeams[4]?.id, team2Id: insertedTeams[5]?.id, nextMatchId: 6, nextLooserMatchId: 8 },
    { id: 4, tournamentRoundText: "W-R1", state: "SCHEDULED", isLoserBracket: false, team1Id: insertedTeams[6]?.id, team2Id: insertedTeams[7]?.id, nextMatchId: 6, nextLooserMatchId: 8 },
    
    // WINNERS ROUND 2
    { id: 5, tournamentRoundText: "W-R2", state: "SCHEDULED", isLoserBracket: false, team1Id: null, team2Id: null, nextMatchId: 11, nextLooserMatchId: 10 },
    { id: 6, tournamentRoundText: "W-R2", state: "SCHEDULED", isLoserBracket: false, team1Id: null, team2Id: null, nextMatchId: 11, nextLooserMatchId: 9 },
    
    // LOSERS ROUND 1
    { id: 7, tournamentRoundText: "L-R1", state: "SCHEDULED", isLoserBracket: true, team1Id: null, team2Id: null, nextMatchId: 9, nextLooserMatchId: null },
    { id: 8, tournamentRoundText: "L-R1", state: "SCHEDULED", isLoserBracket: true, team1Id: null, team2Id: null, nextMatchId: 10, nextLooserMatchId: null },
    
    // LOSERS ROUND 2
    { id: 9, tournamentRoundText: "L-R2", state: "SCHEDULED", isLoserBracket: true, team1Id: null, team2Id: null, nextMatchId: 12, nextLooserMatchId: null },
    { id: 10, tournamentRoundText: "L-R2", state: "SCHEDULED", isLoserBracket: true, team1Id: null, team2Id: null, nextMatchId: 12, nextLooserMatchId: null },

    // LOSERS ROUND 3
    { id: 12, tournamentRoundText: "L-R3", state: "SCHEDULED", isLoserBracket: true, team1Id: null, team2Id: null, nextMatchId: 13, nextLooserMatchId: null },
    
    // WINNERS FINAL
    { id: 11, tournamentRoundText: "W-Final", state: "SCHEDULED", isLoserBracket: false, team1Id: null, team2Id: null, nextMatchId: 14, nextLooserMatchId: 13 },
    
    // LOSERS FINAL
    { id: 13, tournamentRoundText: "L-Final", state: "SCHEDULED", isLoserBracket: true, team1Id: null, team2Id: null, nextMatchId: 14, nextLooserMatchId: null },
    
    // GRAND FINAL
    { id: 14, tournamentRoundText: "Grand Final", state: "SCHEDULED", isLoserBracket: false, team1Id: null, team2Id: null, nextMatchId: null, nextLooserMatchId: null },
  ];

  await db.insert(match).values(matchesToInsert);
  
  console.log("Seeded matches successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding failed:");
  console.error(e);
  process.exit(1);
});
