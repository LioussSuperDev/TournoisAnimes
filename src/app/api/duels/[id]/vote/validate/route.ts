import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel, updateDuelPhase } from "@/lib/db/queries/tournament";
import { getVote, listVotesForDuel, setVoteValidated } from "@/lib/db/queries/votes";
import { listUsers } from "@/lib/db/queries/users";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";
import { performSpin } from "@/lib/duel/spin";

const bodySchema = z.object({ validated: z.boolean() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (duel.phase !== "voting" && duel.phase !== "powers_validation") {
    return NextResponse.json({ error: "Validation impossible dans cette phase." }, { status: 409 });
  }

  const myVote = await getVote(id, auth.user.id);
  if (!myVote) return NextResponse.json({ error: "Tu dois voter avant de valider." }, { status: 400 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  await setVoteValidated(id, auth.user.id, parsed.data.validated);
  await logAction(auth.user.id, "vote.validate", { duelId: id, validated: parsed.data.validated });

  if (parsed.data.validated && duel.phase === "voting") {
    await updateDuelPhase(id, "powers_validation");
  }

  const [allUsers, allVotes] = await Promise.all([listUsers(), listVotesForDuel(id)]);
  const allValidated =
    allUsers.length > 0 &&
    allUsers.every((u) => allVotes.some((v) => v.userId === u.id && v.validated));

  if (allValidated) {
    try {
      await performSpin(id);
    } catch {
      // no-op: leaves it for manual admin trigger if segment building fails
    }
  }

  pingDuelUpdate(id);
  return NextResponse.json({ ok: true, autoSpun: allValidated });
}
