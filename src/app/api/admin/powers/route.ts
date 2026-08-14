import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAdmin } from "@/lib/auth/api";
import { listAllPlayerPowers, setPlayerPowerQuantity } from "@/lib/db/queries/powers";
import { POWER_DEFINITIONS } from "@/lib/powers/registry";
import { logAction } from "@/lib/db/queries/actionLog";
import { pingTournament } from "@/lib/realtime/io";

export async function GET() {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ powers: await listAllPlayerPowers() });
}

const bodySchema = z.object({
  userId: z.string().min(1),
  powerType: z.enum(Object.keys(POWER_DEFINITIONS) as [string, ...string[]]),
  quantity: z.number().int().min(0).max(99),
});

export async function PATCH(req: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Champs invalides." }, { status: 400 });

  const { userId, powerType, quantity } = parsed.data;
  const row = await setPlayerPowerQuantity(userId, powerType as never, quantity);
  await logAction(auth.user.id, "admin.power.set", { userId, powerType, quantity });
  pingTournament();
  return NextResponse.json({ power: row });
}
