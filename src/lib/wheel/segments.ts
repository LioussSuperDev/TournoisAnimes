import { randomInt } from "node:crypto";
import { listVotesForDuel } from "@/lib/db/queries/votes";
import { listUsagesForDuel } from "@/lib/db/queries/powerUsages";

export interface WheelSegment {
  ownerId: string;
  endingId: string;
  source: "base" | "double" | "boost";
  color: string;
}

// Vivid, mutually distinct hues — picked (not fully random RGB) so the
// wheel never lands on a muddy or low-contrast color. Reshuffled on every
// spin so segments get new colors each launch, independent of the fixed
// per-ending color used elsewhere (vote buttons, ending labels).
const SEGMENT_COLOR_PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

function shuffledSegmentColors(): string[] {
  const arr = [...SEGMENT_COLOR_PALETTE];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

  const segments: Omit<WheelSegment, "color">[] = [];

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

  const colors = shuffledSegmentColors();
  return segments.map((seg, i) => ({ ...seg, color: colors[i % colors.length] }));
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
