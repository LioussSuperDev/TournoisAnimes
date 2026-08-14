import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel } from "@/lib/db/queries/tournament";
import { performSpin, canRelaunch } from "@/lib/duel/spin";
import { tryConsumePower, refundPower } from "@/lib/db/queries/powers";
import { recordPostWheelUsage } from "@/lib/db/queries/powerUsages";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (duel.phase !== "result" && duel.phase !== "post_powers") {
    return NextResponse.json({ error: "Relance impossible dans cette phase." }, { status: 409 });
  }
  if (!(await canRelaunch(id))) {
    return NextResponse.json({ error: "Le résultat n'est pas éligible à la relance." }, { status: 409 });
  }

  const consumed = await tryConsumePower(auth.user.id, "relance_roue");
  if (!consumed) {
    return NextResponse.json({ error: "Plus de Relance la Roue disponible." }, { status: 409 });
  }

  try {
    await performSpin(id);
  } catch (e) {
    await refundPower(auth.user.id, "relance_roue");
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  await recordPostWheelUsage(id, auth.user.id, "relance_roue", {});
  await logAction(auth.user.id, "power.relance_roue", { duelId: id });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
