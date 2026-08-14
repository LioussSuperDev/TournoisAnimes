import { NextResponse } from "next/server";
import { ALLOWED_USERNAMES } from "@/lib/auth/constants";
import { findUserByUsername } from "@/lib/db/queries/users";
import { isOnline } from "@/lib/realtime/presence";

/** Public (pre-login) — which of the 4 fixed profiles are currently taken
 * by a connected player, so the picker can grey them out. No auth: this
 * is exactly what an unauthenticated visitor needs to see before they can
 * log in at all. */
export async function GET() {
  const profiles = await Promise.all(
    ALLOWED_USERNAMES.map(async (username) => {
      const user = await findUserByUsername(username);
      return { username, online: user ? isOnline(user.id) : false };
    })
  );
  return NextResponse.json({ profiles });
}
