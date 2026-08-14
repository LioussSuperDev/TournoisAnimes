import { desc, eq, and } from "drizzle-orm";
import { db } from "../client";
import { powerUsages, endings, users } from "../schema";

export async function listPoulainDorUsages() {
  const rows = await db
    .select({
      id: powerUsages.id,
      userId: powerUsages.userId,
      username: users.username,
      duelId: powerUsages.duelId,
      endingId: powerUsages.targetEndingId,
      endingName: endings.name,
      youtubeUrl: endings.youtubeUrl,
      createdAt: powerUsages.createdAt,
    })
    .from(powerUsages)
    .leftJoin(users, eq(powerUsages.userId, users.id))
    .leftJoin(endings, eq(powerUsages.targetEndingId, endings.id))
    .where(and(eq(powerUsages.powerType, "poulain_dor"), eq(powerUsages.status, "applied")))
    .orderBy(desc(powerUsages.createdAt))
    .all();
  return rows;
}
