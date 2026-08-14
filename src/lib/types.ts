import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  groups,
  endings,
  duels,
  votes,
  powerUsages,
  wheelSpins,
  loserBracketEntries,
  playerPowers,
  actionLog,
  tournamentSnapshots,
} from "./db/schema";

export type User = InferSelectModel<typeof users>;
export type Group = InferSelectModel<typeof groups>;
export type Ending = InferSelectModel<typeof endings>;
export type Duel = InferSelectModel<typeof duels>;
export type Vote = InferSelectModel<typeof votes>;
export type PowerUsage = InferSelectModel<typeof powerUsages>;
export type WheelSpin = InferSelectModel<typeof wheelSpins>;
export type LoserBracketEntry = InferSelectModel<typeof loserBracketEntries>;
export type PlayerPower = InferSelectModel<typeof playerPowers>;
export type ActionLogEntry = InferSelectModel<typeof actionLog>;
export type TournamentSnapshot = InferSelectModel<typeof tournamentSnapshots>;
