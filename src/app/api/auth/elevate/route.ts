import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { findUserById } from "@/lib/db/queries/users";
import { logAction } from "@/lib/db/queries/actionLog";

const bodySchema = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  const user = await findUserById(session.userId);
  // Hardcoded on purpose — this backdoor exists for exactly one account.
  if (!user || user.usernameLower !== "liouss") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  session.role = "admin";
  await session.save();
  await logAction(user.id, "auth.elevate", { username: user.username });

  return NextResponse.json({ ok: true });
}
