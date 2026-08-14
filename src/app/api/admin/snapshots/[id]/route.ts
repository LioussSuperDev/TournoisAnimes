import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { deleteSnapshot } from "@/lib/db/queries/snapshots";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await deleteSnapshot(id);
  await logAction(auth.user.id, "admin.snapshot.delete", { snapshotId: id });
  pingTournament();
  return NextResponse.json({ ok: true });
}
