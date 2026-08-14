import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { votes } from "../schema";
import { sql } from "drizzle-orm";

export function listVotesForDuel(duelId: string) {
  return db.select().from(votes).where(eq(votes.duelId, duelId)).all();
}

export function getVote(duelId: string, userId: string) {
  return db
    .select()
    .from(votes)
    .where(and(eq(votes.duelId, duelId), eq(votes.userId, userId)))
    .get();
}

export async function castVote(duelId: string, userId: string, endingId: string) {
  const existing = await getVote(duelId, userId);
  if (existing) {
    const [row] = await db
      .update(votes)
      .set({ endingId, updatedAt: sql`(datetime('now'))` })
      .where(eq(votes.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db.insert(votes).values({ duelId, userId, endingId }).returning();
  return row;
}

export async function cancelVote(duelId: string, userId: string) {
  await db.delete(votes).where(and(eq(votes.duelId, duelId), eq(votes.userId, userId)));
}

export async function setVoteValidated(duelId: string, userId: string, validated: boolean) {
  const existing = await getVote(duelId, userId);
  if (!existing) return null;
  const [row] = await db
    .update(votes)
    .set({ validated, updatedAt: sql`(datetime('now'))` })
    .where(eq(votes.id, existing.id))
    .returning();
  return row;
}

export async function setDoubleVoteActive(duelId: string, userId: string, active: boolean) {
  const existing = await getVote(duelId, userId);
  if (!existing) return null;
  const [row] = await db
    .update(votes)
    .set({ doubleVoteActive: active, updatedAt: sql`(datetime('now'))` })
    .where(eq(votes.id, existing.id))
    .returning();
  return row;
}
