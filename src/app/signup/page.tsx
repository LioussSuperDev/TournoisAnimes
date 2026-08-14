"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProfileTiles } from "@/components/auth/ProfileTiles";

export default function SignupPage() {
  const router = useRouter();
  const [registered, setRegistered] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/registered")
      .then((r) => r.json())
      .then((d) => setRegistered(d.registered ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username) {
      setError("Choisis ton profil.");
      return;
    }
    if (password.length < 4) {
      setError("Mot de passe trop court (4 caractères minimum).");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
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
        <p className="text-center text-muted mb-6">Créer ton compte joueur</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <ProfileTiles
            selected={username}
            onSelect={setUsername}
            disabledUsernames={registered}
            disabledHint="Ce profil a déjà un compte, connecte-toi plutôt."
          />

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-surface-2 border border-border px-4 py-2.5 outline-none focus:border-accent"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg bg-surface-2 border border-border px-4 py-2.5 outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent-2 hover:underline">
            Connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
