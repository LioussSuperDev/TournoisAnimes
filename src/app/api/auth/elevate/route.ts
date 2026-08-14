import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/db/queries/users";
import { logAction } from "@/lib/db/queries/actionLog";

export async function POST() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const user = await findUserById(session.userId);
  // Hardcoded on purpose — this backdoor exists for exactly one account.
  // No credential to check anymore (profiles have none) — being logged in
  // as this exact session's Liouss is itself the only gate.
  if (!user || user.usernameLower !== "liouss") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  session.role = "admin";
  await session.save();
  await logAction(user.id, "auth.elevate", { username: user.username });

  return NextResponse.json({ ok: true });
}
