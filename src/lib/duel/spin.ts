import { db } from "@/lib/db/client";
import { wheelSpins, duels } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { buildSegments, pickWinnerIndex, type WheelSegment } from "@/lib/wheel/segments";
import { applyAllPending } from "@/lib/db/queries/powerUsages";
import { updateDuelPhase, getDuel, updateEnding } from "@/lib/db/queries/tournament";

export interface SpinResult {
  segments: WheelSegment[];
  winnerIndex: number;
  winnerEndingId: string;
}

export async function performSpin(duelId: string): Promise<SpinResult> {
  const segments = await buildSegments(duelId);
  if (segments.length === 0) {
    throw new Error("Aucun vote validé — impossible de lancer la roue.");
  }
  const winnerIndex = pickWinnerIndex(segments);
  const winnerEndingId = segments[winnerIndex].endingId;

  await db.insert(wheelSpins).values({
    duelId,
    segmentsJson: JSON.stringify(segments),
    winnerSegmentIndex: winnerIndex,
    winnerEndingId,
  });

  await applyAllPending(duelId);
  await db.update(duels).set({ winnerEndingId }).where(eq(duels.id, duelId));
  await updateEnding(winnerEndingId, { qualified: true });
  await updateDuelPhase(duelId, "result");

  return { segments, winnerIndex, winnerEndingId };
}

export async function latestSpin(duelId: string) {
  return (
    (await db
      .select()
      .from(wheelSpins)
      .where(eq(wheelSpins.duelId, duelId))
      .orderBy(desc(wheelSpins.spunAt))
      .limit(1)
      .get()) ?? null
  );
}

export async function canRelaunch(duelId: string): Promise<boolean> {
  const duel = await getDuel(duelId);
  if (!duel) return false;
  const spin = await latestSpin(duelId);
  if (!spin) return false;
  const segments: WheelSegment[] = JSON.parse(spin.segmentsJson);
  const countA = segments.filter((s) => s.endingId === duel.endingAId).length;
  const countB = segments.filter((s) => s.endingId === duel.endingBId).length;
  return countA === countB;
}
