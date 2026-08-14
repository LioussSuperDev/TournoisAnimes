import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel } from "@/lib/db/queries/tournament";
import { castVote, cancelVote } from "@/lib/db/queries/votes";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

const bodySchema = z.object({ endingId: z.string().min(1) });

function canEditVote(phase: string) {
  return phase === "voting" || phase === "powers_validation";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (!canEditVote(duel.phase)) {
    return NextResponse.json({ error: "Le vote n'est plus modifiable." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ending invalide." }, { status: 400 });
  if (parsed.data.endingId !== duel.endingAId && parsed.data.endingId !== duel.endingBId) {
    return NextResponse.json({ error: "Cet ending ne fait pas partie du duel." }, { status: 400 });
  }

  await castVote(id, auth.user.id, parsed.data.endingId);
  await logAction(auth.user.id, "vote.cast", { duelId: id, endingId: parsed.data.endingId });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (!canEditVote(duel.phase)) {
    return NextResponse.json({ error: "Le vote n'est plus modifiable." }, { status: 409 });
  }

  await cancelVote(id, auth.user.id);
  await logAction(auth.user.id, "vote.cancel", { duelId: id });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
