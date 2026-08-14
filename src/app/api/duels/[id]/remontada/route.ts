import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel, getEnding, updateDuelPhase } from "@/lib/db/queries/tournament";
import { tryConsumePower } from "@/lib/db/queries/powers";
import { recordPostWheelUsage } from "@/lib/db/queries/powerUsages";
import { db } from "@/lib/db/client";
import { loserBracketEntries } from "@/lib/db/schema";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate, pingLoserBracket } from "@/lib/realtime/io";

const bodySchema = z.object({ losingEndingId: z.string().min(1) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (duel.phase !== "result" && duel.phase !== "post_powers") {
    return NextResponse.json({ error: "La Remontada n'est utilisable qu'après la roue." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ending invalide." }, { status: 400 });
  const { losingEndingId } = parsed.data;
  if (losingEndingId !== duel.endingAId && losingEndingId !== duel.endingBId) {
    return NextResponse.json({ error: "Cet ending ne fait pas partie du duel." }, { status: 400 });
  }
  if (losingEndingId === duel.winnerEndingId) {
    return NextResponse.json({ error: "Le gagnant ne peut pas aller au Loser Bracket." }, { status: 400 });
  }

  const consumed = await tryConsumePower(auth.user.id, "remontada");
  if (!consumed) {
    return NextResponse.json({ error: "Plus de Remontada disponible." }, { status: 409 });
  }

  const ending = await getEnding(losingEndingId);
  await db.insert(loserBracketEntries).values({
    userId: auth.user.id,
    endingId: losingEndingId,
    groupIdOrigin: duel.groupId,
    youtubeUrl: ending?.youtubeUrl ?? "",
    duelId: id,
  });
  await recordPostWheelUsage(id, auth.user.id, "remontada", { targetEndingId: losingEndingId });
  await logAction(auth.user.id, "power.remontada", { duelId: id, losingEndingId });

  if (duel.phase === "result") {
    await updateDuelPhase(id, "post_powers");
  }

  pingDuelUpdate(id);
  pingLoserBracket();
  return NextResponse.json({ ok: true });
}
