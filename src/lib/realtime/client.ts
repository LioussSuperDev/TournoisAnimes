"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: "/socket.io" });
  }
  return socket;
}

/** The picker page opens a socket before anyone is logged in (to receive
 * presence:update while choosing a profile), and the server only reads
 * the session cookie once, at connect time. Call this right after
 * logging in so the existing connection is dropped and re-established
 * under the now-valid session — otherwise that browser tab would never
 * get marked online. */
export function reconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket.connect();
  }
}
