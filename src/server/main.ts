import { createServer } from "node:http";
import os from "node:os";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "../lib/realtime/io";
import { markOnline, markOffline } from "../lib/realtime/presence";
import { sessionFromCookieHeader } from "../lib/auth/socket";
import { ensureMigrated } from "../lib/db/client";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const hostname = "0.0.0.0";

function localIPs(): string[] {
  const nets = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

async function main() {
  await ensureMigrated();

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { cors: { origin: "*" } });
  setIO(io);

  io.on("connection", async (socket) => {
    const session = await sessionFromCookieHeader(socket.request.headers.cookie);
    // Logged-out visitors stay connected too — the profile picker needs
    // live presence:update broadcasts before anyone has a session. They
    // just don't get registered as "online" themselves.
    if (!session?.userId) return;

    const userId = session.userId;
    markOnline(userId, socket.id);
    io.emit("presence:update");

    socket.on("disconnect", () => {
      markOffline(userId, socket.id);
      io.emit("presence:update");
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`\n> Tournoi Endings Anime prêt`);
    console.log(`> Local:   http://localhost:${port}`);
    for (const ip of localIPs()) {
      console.log(`> Réseau:  http://${ip}:${port}`);
    }
    console.log("");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
