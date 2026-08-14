import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api";
import { listUsers } from "@/lib/db/queries/users";
import { isOnline } from "@/lib/realtime/presence";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const all = await listUsers();
  return NextResponse.json({
    users: all.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      online: isOnline(u.id),
    })),
  });
}
