// Stored on globalThis rather than a module-level variable: the custom
// server (server.ts/main.ts, loaded directly by tsx) and Next's API routes
// (bundled separately by Next's own compiler) end up as two distinct
// module instances of this file, each with its own module scope — but
// they share the same Node process, so globalThis is the one place both
// sides actually see the same Map. Same trick as db/client.ts's __sqlite.
declare global {
  var __onlineSockets: Map<string, Set<string>> | undefined;
}

const onlineSockets = globalThis.__onlineSockets ?? new Map<string, Set<string>>();
globalThis.__onlineSockets = onlineSockets;

export function markOnline(userId: string, socketId: string) {
  const set = onlineSockets.get(userId) ?? new Set<string>();
  set.add(socketId);
  onlineSockets.set(userId, set);
}

export function markOffline(userId: string, socketId: string) {
  const set = onlineSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineSockets.delete(userId);
}

export function isOnline(userId: string): boolean {
  return (onlineSockets.get(userId)?.size ?? 0) > 0;
}

export function onlineUserIds(): string[] {
  return [...onlineSockets.keys()];
}
