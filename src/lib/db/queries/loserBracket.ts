import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { loserBracketEntries, endings, groups, users } from "../schema";

export async function listLoserBracketEntries() {
  const rows = await db
    .select({
      id: loserBracketEntries.id,
      userId: loserBracketEntries.userId,
      username: users.username,
      endingId: loserBracketEntries.endingId,
      endingName: endings.name,
      youtubeUrl: loserBracketEntries.youtubeUrl,
      groupName: groups.name,
      duelId: loserBracketEntries.duelId,
      createdAt: loserBracketEntries.createdAt,
    })
    .from(loserBracketEntries)
    .leftJoin(users, eq(loserBracketEntries.userId, users.id))
    .leftJoin(endings, eq(loserBracketEntries.endingId, endings.id))
    .leftJoin(groups, eq(loserBracketEntries.groupIdOrigin, groups.id))
    .orderBy(desc(loserBracketEntries.createdAt))
    .all();
  return rows;
}
