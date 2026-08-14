"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileTiles } from "@/components/auth/ProfileTiles";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username) {
      setError("Choisis ton profil.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur inconnue.");
      return;
    }
    router.push("/tournoi");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <h1 className="text-2xl font-black tracking-tight text-center mb-1">
          TOURNOI ENDINGS ANIME
        </h1>
        <p className="text-center text-muted mb-6">Connexion</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <ProfileTiles selected={username} onSelect={setUsername} />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-surface-2 border border-border px-4 py-2.5 outline-none focus:border-accent"
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-accent-2 hover:underline">
            Inscription
          </Link>
        </p>
      </div>
    </main>
  );
}
