import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { loadSnapshot } from "@/lib/db/queries/snapshots";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament, pingDuelUpdate, pingLoserBracket } from "@/lib/realtime/io";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  let snapshot;
  try {
    snapshot = await loadSnapshot(id);
  } catch {
    return NextResponse.json({ error: "Sauvegarde introuvable." }, { status: 404 });
  }
  await logAction(auth.user.id, "admin.snapshot.load", {
    snapshotId: id,
    name: snapshot.name,
  });

  pingTournament();
  pingDuelUpdate("*");
  pingLoserBracket();
  return NextResponse.json({ ok: true });
}
