import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel } from "@/lib/db/queries/tournament";
import { getVote, setDoubleVoteActive } from "@/lib/db/queries/votes";
import { tryConsumePower, refundPower } from "@/lib/db/queries/powers";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

const bodySchema = z.object({ activate: z.boolean() });

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
    return NextResponse.json({ error: "Le Double Vote n'est plus modifiable." }, { status: 409 });
  }

  const myVote = await getVote(id, auth.user.id);
  if (!myVote) return NextResponse.json({ error: "Vote d'abord avant d'activer le Double Vote." }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  if (parsed.data.activate && !myVote.doubleVoteActive) {
    const consumed = await tryConsumePower(auth.user.id, "double_vote");
    if (!consumed) return NextResponse.json({ error: "Plus de Double Vote disponible." }, { status: 409 });
    await setDoubleVoteActive(id, auth.user.id, true);
  } else if (!parsed.data.activate && myVote.doubleVoteActive) {
    await setDoubleVoteActive(id, auth.user.id, false);
    await refundPower(auth.user.id, "double_vote");
  }

  await logAction(auth.user.id, "power.double_vote.set", { duelId: id, activate: parsed.data.activate });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
