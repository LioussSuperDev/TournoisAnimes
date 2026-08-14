import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { getDuel, completeDuel } from "@/lib/db/queries/tournament";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (!duel.winnerEndingId) {
    return NextResponse.json({ error: "Ce duel n'a pas encore de résultat." }, { status: 409 });
  }

  await completeDuel(id, duel.winnerEndingId);
  await logAction(auth.user.id, "admin.duel.finalize", { duelId: id });
  pingTournament();
  return NextResponse.json({ ok: true });
}
