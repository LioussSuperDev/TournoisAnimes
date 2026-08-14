import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByUsername } from "@/lib/db/queries/users";
import { logAction } from "@/lib/db/queries/actionLog";

const bodySchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  const { username, password } = parsed.data;

  const user = await findUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role as "player" | "admin";
  await session.save();

  await logAction(user.id, "auth.login", { username: user.username });

  return NextResponse.json({ ok: true, role: user.role });
}
