import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  pgTableCreator,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `ceta-web_${name}`);



export const team = createTable("team", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  name: d.varchar({ length: 256 }).notNull(),
}));

export const match = createTable("match", (d) => ({
  id: d.integer().primaryKey(),
  challenge: d.varchar({ length: 256 }).notNull().default("fairway"), // 'fairway', 'iot', 'bucket'
  nextMatchId: d.integer(), // null if final
  nextLooserMatchId: d.integer(), // null if loser is eliminated
  tournamentRoundText: d.varchar({ length: 256 }).notNull(),
  state: d.varchar({ length: 256 }).notNull(), // 'SCHEDULED', 'DONE'
  team1Id: d.integer().references(() => team.id),
  team2Id: d.integer().references(() => team.id),
  winnerId: d.integer().references(() => team.id),
  isLoserBracket: boolean("is_loser_bracket").default(false).notNull(),
}));

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = createTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = createTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = createTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const matchRelations = relations(match, ({ one }) => ({
  team1: one(team, { fields: [match.team1Id], references: [team.id] }),
  team2: one(team, { fields: [match.team2Id], references: [team.id] }),
  winner: one(team, { fields: [match.winnerId], references: [team.id] }),
}));

