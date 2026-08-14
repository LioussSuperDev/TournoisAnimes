import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { playerPowers } from "../schema";
import type { PowerType } from "@/lib/powers/registry";

export function listAllPlayerPowers() {
  return db.select().from(playerPowers).all();
}

export function listPowersForUser(userId: string) {
  return db.select().from(playerPowers).where(eq(playerPowers.userId, userId)).all();
}

export function getPlayerPower(userId: string, powerType: PowerType) {
  return db
    .select()
    .from(playerPowers)
    .where(and(eq(playerPowers.userId, userId), eq(playerPowers.powerType, powerType)))
    .get();
}

export async function setPlayerPowerQuantity(userId: string, powerType: PowerType, quantity: number) {
  const existing = await getPlayerPower(userId, powerType);
  const clamped = Math.max(0, quantity);
  if (existing) {
    const [row] = await db
      .update(playerPowers)
      .set({ quantity: clamped })
      .where(eq(playerPowers.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db
    .insert(playerPowers)
    .values({ userId, powerType, quantity: clamped })
    .returning();
  return row;
}

export async function adjustPlayerPowerQuantity(userId: string, powerType: PowerType, delta: number) {
  const existing = await getPlayerPower(userId, powerType);
  const current = existing?.quantity ?? 0;
  return setPlayerPowerQuantity(userId, powerType, current + delta);
}

/** Consumes one use; returns false (no-op) if the player has none left. */
export async function tryConsumePower(userId: string, powerType: PowerType): Promise<boolean> {
  const existing = await getPlayerPower(userId, powerType);
  if (!existing || existing.quantity <= 0) return false;
  await db
    .update(playerPowers)
    .set({ quantity: existing.quantity - 1 })
    .where(eq(playerPowers.id, existing.id));
  return true;
}

export async function refundPower(userId: string, powerType: PowerType) {
  await adjustPlayerPowerQuantity(userId, powerType, 1);
}
