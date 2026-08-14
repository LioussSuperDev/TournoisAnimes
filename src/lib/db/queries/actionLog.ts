import { db } from "../client";
import { actionLog, users } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function logAction(
  userId: string | null,
  type: string,
  payload: Record<string, unknown> = {}
) {
  await db.insert(actionLog).values({
    userId: userId ?? undefined,
    type,
    payloadJson: JSON.stringify(payload),
  });
}

export function listHistory(limit = 200) {
  return db
    .select({
      id: actionLog.id,
      userId: actionLog.userId,
      username: users.username,
      type: actionLog.type,
      payloadJson: actionLog.payloadJson,
      createdAt: actionLog.createdAt,
    })
    .from(actionLog)
    .leftJoin(users, eq(actionLog.userId, users.id))
    .orderBy(desc(actionLog.createdAt))
    .limit(limit)
    .all();
}
