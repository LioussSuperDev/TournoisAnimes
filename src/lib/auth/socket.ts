import { unsealData } from "iron-session";
import { sessionOptions, type SessionData } from "./session";

function parseCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}

export async function sessionFromCookieHeader(
  cookieHeader: string | undefined
): Promise<SessionData | null> {
  const raw = parseCookie(cookieHeader, sessionOptions.cookieName);
  if (!raw) return null;
  try {
    const data = await unsealData<SessionData>(raw, { password: sessionOptions.password });
    if (!data.userId) return null;
    return data;
  } catch {
    return null;
  }
}
