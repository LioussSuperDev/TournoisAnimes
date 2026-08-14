import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => nanoid());

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`);

export const users = sqliteTable(
  "users",
  {
    id: id(),
    username: text("username").notNull(),
    usernameLower: text("username_lower").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["player", "admin"] })
      .notNull()
      .default("player"),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("users_username_lower_idx").on(table.usernameLower)]
);

export const playerPowers = sqliteTable(
  "player_powers",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    powerType: text("power_type").notNull(),
    quantity: integer("quantity").notNull().default(0),
  },
  (table) => [uniqueIndex("player_powers_user_type_idx").on(table.userId, table.powerType)]
);

export const groups = sqliteTable("groups", {
  id: id(),
  name: text("name").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: createdAt(),
});

export const endings = sqliteTable("endings", {
  id: id(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id),
  name: text("name").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  color: text("color").notNull().default("#6366f1"),
  qualified: integer("qualified", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const DUEL_PHASES = [
  "viewing",
  "voting",
  "powers_validation",
  "wheel",
  "result",
  "post_powers",
  "done",
] as const;
export type DuelPhase = (typeof DUEL_PHASES)[number];

export const VIEWING_STAGES = ["a", "b", "free"] as const;
export type ViewingStage = (typeof VIEWING_STAGES)[number];

export const duels = sqliteTable("duels", {
  id: id(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id),
  endingAId: text("ending_a_id")
    .notNull()
    .references(() => endings.id),
  endingBId: text("ending_b_id")
    .notNull()
    .references(() => endings.id),
  phase: text("phase", { enum: DUEL_PHASES }).notNull().default("viewing"),
  viewingStage: text("viewing_stage", { enum: VIEWING_STAGES }).notNull().default("a"),
  status: text("status", { enum: ["pending", "active", "completed"] })
    .notNull()
    .default("pending"),
  winnerEndingId: text("winner_ending_id").references(() => endings.id),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: createdAt(),
});

export const votes = sqliteTable(
  "votes",
  {
    id: id(),
    duelId: text("duel_id")
      .notNull()
      .references(() => duels.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    endingId: text("ending_id")
      .notNull()
      .references(() => endings.id),
    validated: integer("validated", { mode: "boolean" }).notNull().default(false),
    doubleVoteActive: integer("double_vote_active", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex("votes_duel_user_idx").on(table.duelId, table.userId)]
);

export const powerUsages = sqliteTable("power_usages", {
  id: id(),
  duelId: text("duel_id")
    .notNull()
    .references(() => duels.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  powerType: text("power_type").notNull(),
  targetUserId: text("target_user_id").references(() => users.id),
  targetEndingId: text("target_ending_id").references(() => endings.id),
  status: text("status", { enum: ["pending", "applied", "cancelled"] })
    .notNull()
    .default("pending"),
  createdAt: createdAt(),
});

export const wheelSpins = sqliteTable("wheel_spins", {
  id: id(),
  duelId: text("duel_id")
    .notNull()
    .references(() => duels.id, { onDelete: "cascade" }),
  segmentsJson: text("segments_json").notNull(),
  winnerSegmentIndex: integer("winner_segment_index").notNull(),
  winnerEndingId: text("winner_ending_id")
    .notNull()
    .references(() => endings.id),
  spunAt: createdAt(),
});

export const loserBracketEntries = sqliteTable("loser_bracket_entries", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  endingId: text("ending_id")
    .notNull()
    .references(() => endings.id),
  groupIdOrigin: text("group_id_origin")
    .notNull()
    .references(() => groups.id),
  youtubeUrl: text("youtube_url").notNull(),
  duelId: text("duel_id")
    .notNull()
    .references(() => duels.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const tournamentSnapshots = sqliteTable("tournament_snapshots", {
  id: id(),
  name: text("name").notNull(),
  dataJson: text("data_json").notNull(),
  createdAt: createdAt(),
});

export const actionLog = sqliteTable("action_log", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull(),
  payloadJson: text("payload_json").notNull().default("{}"),
  createdAt: createdAt(),
});
