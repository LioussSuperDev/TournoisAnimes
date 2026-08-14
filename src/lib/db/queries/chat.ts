import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { chatMessages, users } from "../schema";

export async function listRecentMessages(limit = 100) {
  const rows = await db
    .select({
      id: chatMessages.id,
      userId: chatMessages.userId,
      username: users.username,
      message: chatMessages.message,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .leftJoin(users, eq(chatMessages.userId, users.id))
    .orderBy(desc(chatMessages.id))
    .limit(limit)
    .all();
  return rows.reverse();
}

export async function createMessage(userId: string, message: string) {
  const [row] = await db.insert(chatMessages).values({ userId, message }).returning();
  return row;
}
