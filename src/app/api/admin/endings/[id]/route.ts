import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { deleteEnding, updateEnding } from "@/lib/db/queries/tournament";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

const patchSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  youtubeUrl: z.string().url().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  qualified: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const ending = await updateEnding(id, parsed.data);
  await logAction(auth.user.id, "admin.ending.update", { endingId: id, patch: parsed.data });
  pingTournament();
  return NextResponse.json({ ending });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  try {
    await deleteEnding(id);
  } catch {
    return NextResponse.json(
      { error: "Cet ending est encore utilisé par un duel — supprime le duel d'abord." },
      { status: 409 }
    );
  }
  await logAction(auth.user.id, "admin.ending.delete", { endingId: id });
  pingTournament();
  return NextResponse.json({ ok: true });
}
