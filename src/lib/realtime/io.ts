import type { Server as IOServer } from "socket.io";

declare global {
  var __io: IOServer | undefined;
}

export function setIO(io: IOServer) {
  globalThis.__io = io;
}

export function getIO(): IOServer | null {
  return globalThis.__io ?? null;
}

/** Lightweight "something changed, go refetch" ping. Keeps secrecy simple:
 * every client refetches its own redacted view instead of us crafting
 * per-socket payloads. Fine at this scale (4 players). */
export function pingDuelUpdate(duelId: string) {
  getIO()?.emit("duel:update", { duelId });
}

export function pingPresence() {
  getIO()?.emit("presence:update");
}

export function pingLoserBracket() {
  getIO()?.emit("loser-bracket:update");
}

export function pingTournament() {
  getIO()?.emit("tournament:update");
}
