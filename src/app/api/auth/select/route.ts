import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { isAllowedUsername } from "@/lib/auth/constants";
import { findOrCreateUser } from "@/lib/db/queries/users";
import { isOnline } from "@/lib/realtime/presence";
import { logAction } from "@/lib/db/queries/actionLog";

const bodySchema = z.object({ username: z.string().min(1).max(50) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  const { username } = parsed.data;

  if (!isAllowedUsername(username)) {
    return NextResponse.json(
      { error: "Ce site est privé : ce nom n'est pas autorisé." },
      { status: 403 }
    );
  }

  const user = await findOrCreateUser(username);

  if (isOnline(user.id)) {
    return NextResponse.json(
      { error: "Ce profil est déjà utilisé par quelqu'un de connecté." },
      { status: 409 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role as "player" | "admin";
  await session.save();

  await logAction(user.id, "auth.select", { username: user.username });

  return NextResponse.json({ ok: true, role: user.role });
}
