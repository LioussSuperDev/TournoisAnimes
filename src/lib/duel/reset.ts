import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { wheelSpins, loserBracketEntries } from "@/lib/db/schema";
import { listUsagesForDuel, deleteUsagesForDuel } from "@/lib/db/queries/powerUsages";
import { deleteVotesForDuel } from "@/lib/db/queries/votes";
import { refundPower } from "@/lib/db/queries/powers";
import type { PowerType } from "@/lib/powers/registry";

/** Wipes everything a previous playthrough of this duel produced — votes,
 * power usages, wheel spins, Loser Bracket entries — and refunds every
 * power that was consumed during it. Called whenever a duel is
 * (re)activated: a no-op for a duel's first activation (nothing to wipe
 * yet), a full reset when replaying an already-played one. */
export async function resetDuelPlaythrough(duelId: string) {
  const usages = await listUsagesForDuel(duelId);
  for (const usage of usages) {
    await refundPower(usage.userId, usage.powerType as PowerType);
  }
  await deleteUsagesForDuel(duelId);
  await deleteVotesForDuel(duelId);
  await db.delete(wheelSpins).where(eq(wheelSpins.duelId, duelId));
  await db.delete(loserBracketEntries).where(eq(loserBracketEntries.duelId, duelId));
}
