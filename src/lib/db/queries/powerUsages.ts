import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { powerUsages } from "../schema";
import type { PowerType } from "@/lib/powers/registry";

export function listUsagesForDuel(duelId: string) {
  return db.select().from(powerUsages).where(eq(powerUsages.duelId, duelId)).all();
}

export function getPendingUsage(duelId: string, userId: string, powerType: PowerType) {
  return db
    .select()
    .from(powerUsages)
    .where(
      and(
        eq(powerUsages.duelId, duelId),
        eq(powerUsages.userId, userId),
        eq(powerUsages.powerType, powerType),
        eq(powerUsages.status, "pending")
      )
    )
    .get();
}

export async function setTargetedUsage(
  duelId: string,
  userId: string,
  powerType: PowerType,
  target: { targetUserId?: string; targetEndingId?: string }
) {
  const existing = await getPendingUsage(duelId, userId, powerType);
  if (existing) {
    const [row] = await db
      .update(powerUsages)
      .set(target)
      .where(eq(powerUsages.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(powerUsages)
    .values({ duelId, userId, powerType, ...target })
    .returning();
  return row;
}

export async function cancelPendingUsage(duelId: string, userId: string, powerType: PowerType) {
  const existing = await getPendingUsage(duelId, userId, powerType);
  if (!existing) return false;
  await db.delete(powerUsages).where(eq(powerUsages.id, existing.id));
  return true;
}

export async function recordPostWheelUsage(
  duelId: string,
  userId: string,
  powerType: PowerType,
  target: { targetUserId?: string; targetEndingId?: string }
) {
  const [row] = await db
    .insert(powerUsages)
    .values({ duelId, userId, powerType, status: "applied", ...target })
    .returning();
  return row;
}

export async function deleteUsagesForDuel(duelId: string) {
  await db.delete(powerUsages).where(eq(powerUsages.duelId, duelId));
}

export async function applyAllPending(duelId: string) {
  await db
    .update(powerUsages)
    .set({ status: "applied" })
    .where(and(eq(powerUsages.duelId, duelId), eq(powerUsages.status, "pending")));
}
