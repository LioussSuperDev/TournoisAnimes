import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import {
  deleteDuel,
  setActiveDuel,
  setViewingStage,
  updateDuelPhase,
} from "@/lib/db/queries/tournament";
import { DUEL_PHASES, VIEWING_STAGES } from "@/lib/db/schema";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament, pingDuelUpdate, pingLoserBracket } from "@/lib/realtime/io";
import { clearVideoState } from "@/lib/realtime/videoSync";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("activate") }),
  z.object({ action: z.literal("phase"), phase: z.enum(DUEL_PHASES) }),
  z.object({ action: z.literal("viewingStage"), stage: z.enum(VIEWING_STAGES) }),
]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

  if (parsed.data.action === "activate") {
    const duel = await setActiveDuel(id);
    clearVideoState(id);
    await logAction(auth.user.id, "admin.duel.activate", { duelId: id });
    pingTournament();
    pingLoserBracket();
    return NextResponse.json({ duel });
  }

  if (parsed.data.action === "viewingStage") {
    const duel = await setViewingStage(id, parsed.data.stage);
    clearVideoState(id);
    await logAction(auth.user.id, "admin.duel.viewingStage", { duelId: id, stage: parsed.data.stage });
    pingDuelUpdate(id);
    return NextResponse.json({ duel });
  }

  if (parsed.data.phase === "viewing") clearVideoState(id);
  const duel = await updateDuelPhase(id, parsed.data.phase);
  await logAction(auth.user.id, "admin.duel.phase", { duelId: id, phase: parsed.data.phase });
  pingDuelUpdate(id);
  return NextResponse.json({ duel });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    await deleteDuel(id);
  } catch {
    return NextResponse.json({ error: "Suppression impossible." }, { status: 409 });
  }
  await logAction(auth.user.id, "admin.duel.delete", { duelId: id });
  pingTournament();
  return NextResponse.json({ ok: true });
}
