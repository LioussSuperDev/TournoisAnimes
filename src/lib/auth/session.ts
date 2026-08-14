import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  username?: string;
  role?: "player" | "admin";
}

const password = process.env.SESSION_SECRET ?? "dev-only-secret-change-me-please-32chars";

if (password.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}

export const sessionOptions: SessionOptions = {
  cookieName: "tournoi_session",
  password,
  cookieOptions: {
    secure: false,
    sameSite: "lax",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
