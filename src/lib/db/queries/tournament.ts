import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "../client";
import { duels, endings, groups, type DuelPhase, type ViewingStage } from "../schema";
import { resetDuelPlaythrough } from "@/lib/duel/reset";

export function listGroups() {
  return db.select().from(groups).orderBy(groups.orderIndex).all();
}

export async function createGroup(name: string) {
  const existing = await listGroups();
  const orderIndex = existing.length;
  const [group] = await db.insert(groups).values({ name, orderIndex }).returning();
  return group;
}

export async function deleteGroup(id: string) {
  await db.delete(groups).where(eq(groups.id, id));
}

export function listEndings(groupId?: string) {
  const query = db.select().from(endings);
  if (groupId) return query.where(eq(endings.groupId, groupId)).all();
  return query.all();
}

export function getEnding(id: string) {
  return db.select().from(endings).where(eq(endings.id, id)).get();
}

export async function createEnding(input: {
  groupId: string;
  name: string;
  youtubeUrl: string;
  color?: string;
}) {
  const [ending] = await db
    .insert(endings)
    .values({
      groupId: input.groupId,
      name: input.name,
      youtubeUrl: input.youtubeUrl,
      color: input.color ?? "#6366f1",
    })
    .returning();
  return ending;
}

export async function updateEnding(
  id: string,
  patch: Partial<{ name: string; youtubeUrl: string; color: string; qualified: boolean }>
) {
  const [ending] = await db.update(endings).set(patch).where(eq(endings.id, id)).returning();
  return ending;
}

export async function deleteEnding(id: string) {
  await db.delete(endings).where(eq(endings.id, id));
}

export function listDuels() {
  return db.select().from(duels).orderBy(duels.orderIndex).all();
}

export function getDuel(id: string) {
  return db.select().from(duels).where(eq(duels.id, id)).get();
}

export function getActiveDuel() {
  return db.select().from(duels).where(eq(duels.status, "active")).get();
}

export async function createDuel(input: {
  groupId: string;
  endingAId: string;
  endingBId: string;
}) {
  const existing = await listDuels();
  const orderIndex = existing.length;
  const [duel] = await db
    .insert(duels)
    .values({
      groupId: input.groupId,
      endingAId: input.endingAId,
      endingBId: input.endingBId,
      orderIndex,
    })
    .returning();
  return duel;
}

export async function setActiveDuel(id: string) {
  await db
    .update(duels)
    .set({ status: "pending" })
    .where(and(eq(duels.status, "active"), ne(duels.id, id)));
  // (Re)activating always starts fresh: wipes any votes/pouvoirs/roue/Loser
  // Bracket entries left over from a previous playthrough of this exact
  // duel and refunds the powers they consumed. No-op the first time a duel
  // is activated, since there's nothing to wipe yet.
  await resetDuelPlaythrough(id);
  const [duel] = await db
    .update(duels)
    .set({ status: "active", phase: "viewing", viewingStage: "a", winnerEndingId: null })
    .where(eq(duels.id, id))
    .returning();
  return duel;
}

export async function updateDuelPhase(id: string, phase: DuelPhase) {
  const [duel] = await db
    .update(duels)
    .set(phase === "viewing" ? { phase, viewingStage: "a" } : { phase })
    .where(eq(duels.id, id))
    .returning();
  return duel;
}

export async function setViewingStage(id: string, viewingStage: ViewingStage) {
  const [duel] = await db.update(duels).set({ viewingStage }).where(eq(duels.id, id)).returning();
  return duel;
}

export async function completeDuel(id: string, winnerEndingId: string) {
  const [duel] = await db
    .update(duels)
    .set({ status: "completed", winnerEndingId, phase: "done" })
    .where(eq(duels.id, id))
    .returning();
  return duel;
}

export async function deleteDuel(id: string) {
  await db.delete(duels).where(eq(duels.id, id));
}

export function listDuelsHistory() {
  return db.select().from(duels).orderBy(desc(duels.createdAt)).all();
}
