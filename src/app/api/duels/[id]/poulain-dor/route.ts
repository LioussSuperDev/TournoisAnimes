import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel, updateEnding, updateDuelPhase } from "@/lib/db/queries/tournament";
import { tryConsumePower } from "@/lib/db/queries/powers";
import { recordPostWheelUsage } from "@/lib/db/queries/powerUsages";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate, pingTournament } from "@/lib/realtime/io";

const bodySchema = z.object({ savedEndingId: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (duel.phase !== "result" && duel.phase !== "post_powers") {
    return NextResponse.json({ error: "Le Poulain d'Or n'est utilisable qu'après la roue." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ending invalide." }, { status: 400 });
  const { savedEndingId } = parsed.data;
  if (savedEndingId !== duel.endingAId && savedEndingId !== duel.endingBId) {
    return NextResponse.json({ error: "Cet ending ne fait pas partie du duel." }, { status: 400 });
  }
  if (savedEndingId === duel.winnerEndingId) {
    return NextResponse.json({ error: "Le gagnant n'a pas besoin d'être sauvé." }, { status: 400 });
  }

  const consumed = await tryConsumePower(auth.user.id, "poulain_dor");
  if (!consumed) {
    return NextResponse.json({ error: "Plus de Poulain d'Or disponible." }, { status: 409 });
  }

  await updateEnding(savedEndingId, { qualified: true });
  await recordPostWheelUsage(id, auth.user.id, "poulain_dor", { targetEndingId: savedEndingId });
  await logAction(auth.user.id, "power.poulain_dor", { duelId: id, savedEndingId });

  if (duel.phase === "result") {
    await updateDuelPhase(id, "post_powers");
  }

  pingDuelUpdate(id);
  pingTournament();
  return NextResponse.json({ ok: true });
}
