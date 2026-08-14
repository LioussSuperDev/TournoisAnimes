import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { isAllowedUsername } from "@/lib/auth/constants";
import { createUser, findUserByUsername } from "@/lib/db/queries/users";
import { logAction } from "@/lib/db/queries/actionLog";

const bodySchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(4).max(200),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }
  const { username, password } = parsed.data;

  if (!isAllowedUsername(username)) {
    return NextResponse.json(
      { error: "Ce site est privé : ce nom n'est pas autorisé." },
      { status: 403 }
    );
  }

  const existing = await findUserByUsername(username);
  if (existing) {
    return NextResponse.json(
      { error: "Ce profil a déjà un compte. Utilise la connexion." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(username, passwordHash);

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role as "player" | "admin";
  await session.save();

  await logAction(user.id, "auth.signup", { username: user.username });

  return NextResponse.json({ ok: true, role: user.role });
}
