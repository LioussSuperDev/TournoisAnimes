export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) return shortsMatch[1];
    const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];
    return null;
  } catch {
    return null;
  }
}
