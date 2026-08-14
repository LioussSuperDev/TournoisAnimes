import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel } from "@/lib/db/queries/tournament";
import { cancelPendingUsage, getPendingUsage, setTargetedUsage } from "@/lib/db/queries/powerUsages";
import { tryConsumePower, refundPower } from "@/lib/db/queries/powers";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

const bodySchema = z.object({ endingId: z.string().min(1) });

function canEdit(phase: string) {
  return phase === "voting" || phase === "powers_validation";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (!canEdit(duel.phase)) {
    return NextResponse.json({ error: "Le Boost n'est plus utilisable." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ending invalide." }, { status: 400 });
  if (parsed.data.endingId !== duel.endingAId && parsed.data.endingId !== duel.endingBId) {
    return NextResponse.json({ error: "Cet ending ne fait pas partie du duel." }, { status: 400 });
  }

  const existing = await getPendingUsage(id, auth.user.id, "boost");
  if (!existing) {
    const consumed = await tryConsumePower(auth.user.id, "boost");
    if (!consumed) {
      return NextResponse.json({ error: "Plus de Boost disponible." }, { status: 409 });
    }
  }

  await setTargetedUsage(id, auth.user.id, "boost", { targetEndingId: parsed.data.endingId });
  await logAction(auth.user.id, "power.boost.set", { duelId: id, endingId: parsed.data.endingId });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (!canEdit(duel.phase)) {
    return NextResponse.json({ error: "Le Boost n'est plus annulable." }, { status: 409 });
  }

  const cancelled = await cancelPendingUsage(id, auth.user.id, "boost");
  if (cancelled) await refundPower(auth.user.id, "boost");
  await logAction(auth.user.id, "power.boost.cancel", { duelId: id });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
