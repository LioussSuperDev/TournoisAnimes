import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { getDuel, updateEnding } from "@/lib/db/queries/tournament";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingDuelUpdate } from "@/lib/realtime/io";

const bodySchema = z.object({
  endingId: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const isAllowed = auth.user.role === "admin" || auth.user.username === "ShadyOFF";
  if (!isAllowed) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { id } = await params;
  const duel = await getDuel(id);
  if (!duel) return NextResponse.json({ error: "Duel introuvable." }, { status: 404 });
  if (duel.phase !== "viewing") {
    return NextResponse.json({ error: "La couleur n'est modifiable que pendant le visionnage." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  if (parsed.data.endingId !== duel.endingAId && parsed.data.endingId !== duel.endingBId) {
    return NextResponse.json({ error: "Cet ending ne fait pas partie du duel." }, { status: 400 });
  }

  await updateEnding(parsed.data.endingId, { color: parsed.data.color });
  await logAction(auth.user.id, "ending.color.update", { duelId: id, endingId: parsed.data.endingId, color: parsed.data.color });
  pingDuelUpdate(id);
  return NextResponse.json({ ok: true });
}
