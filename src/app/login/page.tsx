"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileTiles } from "@/components/auth/ProfileTiles";
import { getSocket, reconnectSocket } from "@/lib/realtime/client";

export default function LoginPage() {
  const router = useRouter();
  const [onlineUsernames, setOnlineUsernames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const res = await fetch("/api/auth/profiles");
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled) {
        setOnlineUsernames(
          (data.profiles as { username: string; online: boolean }[])
            .filter((p) => p.online)
            .map((p) => p.username)
        );
      }
    }
    refresh();
    const socket = getSocket();
    socket.on("presence:update", refresh);
    return () => {
      cancelled = true;
      socket.off("presence:update", refresh);
    };
  }, []);

  async function select(username: string) {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/auth/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur inconnue.");
      return;
    }
    reconnectSocket();
    router.push("/tournoi");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <h1 className="text-2xl font-black tracking-tight text-center mb-1">
          TOURNOI ENDINGS ANIME
        </h1>
        <p className="text-center text-muted mb-6">Choisis ton profil</p>

        <ProfileTiles
          selected={null}
          onSelect={select}
          disabledUsernames={onlineUsernames}
          disabledHint="Ce profil est déjà connecté par quelqu'un d'autre."
        />

        {error && <p className="text-danger text-sm mt-4 text-center">{error}</p>}
        {busy && <p className="text-muted text-sm mt-4 text-center">Connexion…</p>}
      </div>
    </main>
  );
}
