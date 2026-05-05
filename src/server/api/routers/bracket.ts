import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { match } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const bracketRouter = createTRPCRouter({
  getAllTeams: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.team.findMany();
  }),

  getAllMatches: publicProcedure
    .input(z.object({
      challenge: z.enum(["fairway", "iot", "bucket"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.match.findMany({
        where: input?.challenge ? eq(match.challenge, input.challenge) : undefined,
        with: {
          team1: true,
          team2: true,
          winner: true,
        },
      });
    }),

  updateMatch: protectedProcedure
    .input(
      z.object({
        matchId: z.number(),
        winnerId: z.number().nullable(),
        state: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find the match
      const currentMatch = await ctx.db.query.match.findFirst({
        where: eq(match.id, input.matchId),
      });

      if (!currentMatch) {
        throw new Error("Match not found");
      }

      // Update the current match
      await ctx.db
        .update(match)
        .set({
          winnerId: input.winnerId,
          state: input.state,
        })
        .where(eq(match.id, input.matchId));

      // If there's a winner, advance them to the next match
      if (input.winnerId && currentMatch.nextMatchId) {
        const nextMatch = await ctx.db.query.match.findFirst({
          where: eq(match.id, currentMatch.nextMatchId),
        });

        if (nextMatch) {
          // Determine if team1 or team2 is empty in the next match
          if (!nextMatch.team1Id) {
            await ctx.db
              .update(match)
              .set({ team1Id: input.winnerId })
              .where(eq(match.id, currentMatch.nextMatchId));
          } else if (!nextMatch.team2Id && nextMatch.team1Id !== input.winnerId) {
            await ctx.db
              .update(match)
              .set({ team2Id: input.winnerId })
              .where(eq(match.id, currentMatch.nextMatchId));
          }
        }
      }
      
      // If there's a looser match, handle the loser
      const loserId = currentMatch.team1Id === input.winnerId ? currentMatch.team2Id : currentMatch.team1Id;
      if (input.winnerId && loserId && currentMatch.nextLooserMatchId) {
        const nextLooserMatch = await ctx.db.query.match.findFirst({
          where: eq(match.id, currentMatch.nextLooserMatchId),
        });
        
        if (nextLooserMatch) {
          if (!nextLooserMatch.team1Id) {
            await ctx.db
              .update(match)
              .set({ team1Id: loserId })
              .where(eq(match.id, currentMatch.nextLooserMatchId));
          } else if (!nextLooserMatch.team2Id && nextLooserMatch.team1Id !== loserId) {
             await ctx.db
              .update(match)
              .set({ team2Id: loserId })
              .where(eq(match.id, currentMatch.nextLooserMatchId));
          }
        }
      }

      return { success: true };
    }),
});
