import { eq } from "drizzle-orm";
import { db } from "../client";
import { users, playerPowers } from "../schema";
import { DEFAULT_POWER_LOADOUT } from "@/lib/powers/registry";

export function findUserByUsername(username: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.usernameLower, username.trim().toLowerCase()))
    .get();
}

export function findUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function listUsers() {
  return db.select().from(users).orderBy(users.createdAt).all();
}

export async function createUser(username: string) {
  const usernameLower = username.trim().toLowerCase();
  const role = usernameLower === "serkcan" ? "admin" : "player";

  const [user] = await db
    .insert(users)
    .values({ username: username.trim(), usernameLower, role })
    .returning();

  await db.insert(playerPowers).values(
    DEFAULT_POWER_LOADOUT.map((p) => ({
      userId: user.id,
      powerType: p.type,
      quantity: p.defaultQuantity,
    }))
  );

  return user;
}

/** Reuses the account if it already exists (its powers/history stay
 * intact), otherwise provisions it — profiles are no longer created via a
 * separate signup step, just picked. */
export async function findOrCreateUser(username: string) {
  const existing = await findUserByUsername(username);
  if (existing) return existing;
  return createUser(username);
}
