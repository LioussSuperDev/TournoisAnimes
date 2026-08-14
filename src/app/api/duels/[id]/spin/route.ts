import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth/api";
import { getDuel } from "@/lib/db/queries/tournament";
import { performSpin } from "@/lib/duel/spin";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (duel.phase !== "voting" && duel.phase !== "powers_validation") {
    return NextResponse.json({ error: "La roue ne peut pas être lancée dans cette phase." }, { status: 409 });
  }

  try {
    await performSpin(id);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  await logAction(auth.user.id, "admin.spin", { duelId: id });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
