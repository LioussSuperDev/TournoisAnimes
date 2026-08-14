import { getActiveDuel, getEnding } from "@/lib/db/queries/tournament";
import { listVotesForDuel } from "@/lib/db/queries/votes";
import { listUsagesForDuel } from "@/lib/db/queries/powerUsages";
import { listPowersForUser } from "@/lib/db/queries/powers";
import { listUsers } from "@/lib/db/queries/users";
import { latestSpin, canRelaunch } from "@/lib/duel/spin";
import { getVideoState } from "@/lib/realtime/videoSync";
import type { WheelSegment } from "@/lib/wheel/segments";
import { POWER_DEFINITIONS, type PowerType } from "@/lib/powers/registry";
import { groups } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export async function buildPlayerDuelView(viewerUserId: string) {
  const duel = await getActiveDuel();
  if (!duel) return { duel: null };

  const [endingA, endingB, group, duelVotes, usages, users, myPowerRows, spin, relaunchable] =
    await Promise.all([
      getEnding(duel.endingAId),
      getEnding(duel.endingBId),
      db.select().from(groups).where(eq(groups.id, duel.groupId)).get(),
      listVotesForDuel(duel.id),
      listUsagesForDuel(duel.id),
      listUsers(),
      listPowersForUser(viewerUserId),
      latestSpin(duel.id),
      duel.phase === "result" || duel.phase === "post_powers" ? canRelaunch(duel.id) : false,
    ]);

  const usersById = Object.fromEntries(users.map((u) => [u.id, u]));
  const myVote = duelVotes.find((v) => v.userId === viewerUserId) ?? null;

  const votesStatus = users.map((u) => {
    const v = duelVotes.find((vv) => vv.userId === u.id);
    return { userId: u.id, username: u.username, hasVoted: !!v, validated: v?.validated ?? false };
  });

  const myPowers = Object.fromEntries(
    Object.keys(POWER_DEFINITIONS).map((type) => [
      type,
      myPowerRows.find((p) => p.powerType === type)?.quantity ?? 0,
    ])
  ) as Record<PowerType, number>;

  const myUsages = usages.filter((u) => u.userId === viewerUserId && u.status === "pending");
  const myPendingEffaceur = myUsages.find((u) => u.powerType === "effaceur");
  const myPendingBoost = myUsages.find((u) => u.powerType === "boost");

  const canSeeWheel = ["wheel", "result", "post_powers", "done"].includes(duel.phase);

  const postWheelUsages = usages.filter(
    (u) => u.powerType === "poulain_dor" || u.powerType === "remontada"
  );

  return {
    duel: {
      id: duel.id,
      phase: duel.phase,
      viewingStage: duel.viewingStage,
      status: duel.status,
      groupName: group?.name ?? "",
      endingA,
      endingB,
      winnerEndingId: duel.winnerEndingId,
      videoState:
        duel.phase === "viewing" && duel.viewingStage !== "free" ? getVideoState(duel.id) : null,
    },
    myVote: myVote
      ? { endingId: myVote.endingId, validated: myVote.validated, doubleVoteActive: myVote.doubleVoteActive }
      : null,
    votesStatus,
    myPowers,
    myPending: {
      effaceurTargetUserId: myPendingEffaceur?.targetUserId ?? null,
      effaceurTargetName: myPendingEffaceur?.targetUserId
        ? usersById[myPendingEffaceur.targetUserId]?.username
        : null,
      boostTargetEndingId: myPendingBoost?.targetEndingId ?? null,
    },
    wheel:
      canSeeWheel && spin
        ? {
            spinId: spin.id,
            segments: JSON.parse(spin.segmentsJson) as WheelSegment[],
            winnerSegmentIndex: spin.winnerSegmentIndex,
            winnerEndingId: spin.winnerEndingId,
          }
        : null,
    canRelaunch: relaunchable,
    postWheelUsages: postWheelUsages.map((u) => ({
      id: u.id,
      username: usersById[u.userId]?.username,
      powerType: u.powerType,
      targetEndingId: u.targetEndingId,
    })),
  };
}
