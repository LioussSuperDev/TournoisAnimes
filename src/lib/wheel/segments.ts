import { randomInt } from "node:crypto";
import { listVotesForDuel } from "@/lib/db/queries/votes";
import { listUsagesForDuel } from "@/lib/db/queries/powerUsages";

export interface WheelSegment {
  ownerId: string;
  endingId: string;
  source: "base" | "double" | "boost";
}

/**
 * Builds the wheel's segment list for a duel from currently validated votes
 * and pending/applied power usages. Effaceur removes exactly one "base"
 * segment for its target — "double" (Double Vote) and "boost" segments are
 * independent and survive it.
 */
export async function buildSegments(duelId: string): Promise<WheelSegment[]> {
  const [duelVotes, usages] = await Promise.all([
    listVotesForDuel(duelId),
    listUsagesForDuel(duelId),
  ]);

  const segments: WheelSegment[] = [];

  for (const vote of duelVotes) {
    if (!vote.validated) continue;
    segments.push({ ownerId: vote.userId, endingId: vote.endingId, source: "base" });
    if (vote.doubleVoteActive) {
      segments.push({ ownerId: vote.userId, endingId: vote.endingId, source: "double" });
    }
  }

  for (const usage of usages) {
    if (usage.powerType !== "boost") continue;
    if (usage.status === "cancelled") continue;
    if (!usage.targetEndingId) continue;
    for (let i = 0; i < 3; i++) {
      segments.push({ ownerId: usage.userId, endingId: usage.targetEndingId, source: "boost" });
    }
  }

  for (const usage of usages) {
    if (usage.powerType !== "effaceur") continue;
    if (usage.status === "cancelled") continue;
    if (!usage.targetUserId) continue;
    const idx = segments.findIndex((s) => s.ownerId === usage.targetUserId && s.source === "base");
    if (idx !== -1) segments.splice(idx, 1);
  }

  return segments;
}

export function pickWinnerIndex(segments: WheelSegment[]): number {
  if (segments.length === 0) throw new Error("Aucun segment à tirer.");
  return randomInt(segments.length);
}

export function isTiedResult(segments: WheelSegment[], endingAId: string, endingBId: string): boolean {
  const countA = segments.filter((s) => s.endingId === endingAId).length;
  const countB = segments.filter((s) => s.endingId === endingBId).length;
  return countA === countB;
}
