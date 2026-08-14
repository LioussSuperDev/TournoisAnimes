import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel } from "@/lib/db/queries/tournament";
import { cancelPendingUsage, getPendingUsage, setTargetedUsage } from "@/lib/db/queries/powerUsages";
import { tryConsumePower, refundPower } from "@/lib/db/queries/powers";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

const bodySchema = z.object({ targetUserId: z.string().min(1) });

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
    return NextResponse.json({ error: "L'Effaceur n'est plus utilisable." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Cible invalide." }, { status: 400 });
  if (parsed.data.targetUserId === auth.user.id) {
    return NextResponse.json({ error: "Impossible de se cibler soi-même." }, { status: 400 });
  }

  const existing = await getPendingUsage(id, auth.user.id, "effaceur");
  if (!existing) {
    const consumed = await tryConsumePower(auth.user.id, "effaceur");
    if (!consumed) {
      return NextResponse.json({ error: "Plus d'Effaceur disponible." }, { status: 409 });
    }
  }

  await setTargetedUsage(id, auth.user.id, "effaceur", { targetUserId: parsed.data.targetUserId });
  await logAction(auth.user.id, "power.effaceur.set", { duelId: id, targetUserId: parsed.data.targetUserId });
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
    return NextResponse.json({ error: "L'Effaceur n'est plus annulable." }, { status: 409 });
  }

  const cancelled = await cancelPendingUsage(id, auth.user.id, "effaceur");
  if (cancelled) await refundPower(auth.user.id, "effaceur");
  await logAction(auth.user.id, "power.effaceur.cancel", { duelId: id });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
