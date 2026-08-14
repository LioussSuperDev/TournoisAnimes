import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { listRecentMessages, createMessage } from "@/lib/db/queries/chat";
import { broadcastChatMessage } from "@/lib/realtime/io";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  return NextResponse.json({ messages: await listRecentMessages() });
}

const bodySchema = z.object({ message: z.string().trim().min(1).max(300) });

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }

  const row = await createMessage(auth.user.id, parsed.data.message);
  const payload = {
    id: row.id,
    userId: auth.user.id,
    username: auth.user.username,
    message: row.message,
    createdAt: row.createdAt,
  };
  broadcastChatMessage(payload);

  return NextResponse.json({ message: payload });
}
