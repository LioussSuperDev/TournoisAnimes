import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { createSnapshot, listSnapshots } from "@/lib/db/queries/snapshots";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ snapshots: await listSnapshots() });
}

const bodySchema = z.object({ name: z.string().min(1).max(100) });

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Nom invalide." }, { status: 400 });

  const snapshot = await createSnapshot(parsed.data.name);
  await logAction(auth.user.id, "admin.snapshot.save", {
    snapshotId: snapshot.id,
    name: snapshot.name,
  });
  pingTournament();
  return NextResponse.json({
    snapshot: { id: snapshot.id, name: snapshot.name, createdAt: snapshot.createdAt },
  });
}
