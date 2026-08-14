"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/realtime/client";
import clsx from "clsx";

interface PresenceUser {
  id: string;
  username: string;
  role: string;
  online: boolean;
}

export function PresenceBar() {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const res = await fetch("/api/presence");
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled) setUsers(data.users);
    }
    refresh();
    const socket = getSocket();
    socket.on("presence:update", refresh);
    return () => {
      cancelled = true;
      socket.off("presence:update", refresh);
    };
  }, []);

  return (
    <div className="fixed top-3 left-3 z-50 rounded-xl border border-border bg-surface/90 backdrop-blur px-3 py-2 text-sm space-y-1 shadow-lg">
      {users.map((u) => (
        <div key={u.id} className="flex items-center gap-2">
          <span
            className={clsx(
              "h-2 w-2 rounded-full",
              u.online ? "bg-success shadow-[0_0_6px] shadow-success" : "bg-muted"
            )}
          />
          <span className={u.online ? "text-foreground" : "text-muted"}>{u.username}</span>
          {u.role === "admin" && <span className="text-[10px] text-accent-2">admin</span>}
        </div>
      ))}
    </div>
  );
}
