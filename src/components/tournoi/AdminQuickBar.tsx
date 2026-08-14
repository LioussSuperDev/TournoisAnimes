"use client";

import { useState } from "react";
import type { PlayerDuelView } from "@/lib/duel/viewTypes";

const PHASE_LABELS: Record<string, string> = {
  viewing: "Visionnage",
  voting: "Vote",
  powers_validation: "Pouvoirs / Validation",
  wheel: "Roue",
  result: "Résultat",
  post_powers: "Pouvoirs post-roue",
  done: "Terminé",
};

async function patchPhase(duelId: string, phase: string) {
  await fetch(`/api/admin/duels/${duelId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "phase", phase }),
  });
}

async function patchViewingStage(duelId: string, stage: "a" | "b" | "free") {
  await fetch(`/api/admin/duels/${duelId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "viewingStage", stage }),
  });
}

export function AdminQuickBar({
  duel,
  onOpenPanel,
  onChanged,
}: {
  duel: PlayerDuelView["duel"];
  onOpenPanel: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
      onChanged();
    }
  }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-accent/40 bg-surface/95 backdrop-blur px-3 py-2 shadow-2xl">
      <span className="text-[10px] uppercase tracking-wide text-accent-2 mr-1">Admin</span>

      {!duel && <span className="text-xs text-muted">Aucun duel actif</span>}

      {duel && (
        <>
          <span className="text-xs text-muted hidden sm:inline">{PHASE_LABELS[duel.phase]}</span>
          <button
            disabled={busy || duel.phase === "viewing"}
            onClick={() => run(() => patchPhase(duel.id, "viewing"))}
            className="rounded px-2 py-1 text-xs border border-border text-muted hover:text-foreground disabled:opacity-40"
          >
            Visionnage
          </button>
          <button
            disabled={busy || duel.phase === "voting"}
            onClick={() => run(() => patchPhase(duel.id, "voting"))}
            className="rounded px-2 py-1 text-xs border border-border text-muted hover:text-foreground disabled:opacity-40"
          >
            Vote
          </button>
          {duel.phase === "viewing" && (
            <span className="flex items-center gap-1 rounded-lg border border-border/60 pl-2 pr-1 py-0.5">
              <span className="text-[10px] text-muted mr-1 hidden md:inline">Vidéo :</span>
              {(
                [
                  { key: "a" as const, label: duel.endingA?.name ?? "A" },
                  { key: "b" as const, label: duel.endingB?.name ?? "B" },
                  { key: "free" as const, label: "Libre" },
                ] as const
              ).map((s) => (
                <button
                  key={s.key}
                  disabled={busy || duel.viewingStage === s.key}
                  onClick={() => run(() => patchViewingStage(duel.id, s.key))}
                  className="rounded px-2 py-1 text-xs border border-accent-2/50 text-accent-2 hover:bg-accent-2 hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-accent-2"
                >
                  {s.label}
                </button>
              ))}
            </span>
          )}
          {(duel.phase === "voting" || duel.phase === "powers_validation") && (
            <button
              disabled={busy}
              onClick={() => run(() => fetch(`/api/duels/${duel.id}/spin`, { method: "POST" }))}
              className="rounded px-2 py-1 text-xs border border-accent text-accent hover:bg-accent hover:text-white disabled:opacity-40"
            >
              Lancer la roue
            </button>
          )}
          {(duel.phase === "result" || duel.phase === "post_powers") && (
            <button
              disabled={busy}
              onClick={() =>
                run(() => fetch(`/api/admin/duels/${duel.id}/finalize`, { method: "POST" }))
              }
              className="rounded px-2 py-1 text-xs border border-success text-success hover:bg-success hover:text-black disabled:opacity-40"
            >
              Terminer le duel
            </button>
          )}
        </>
      )}

      <button
        onClick={onOpenPanel}
        className="rounded px-2 py-1 text-xs bg-accent text-white font-semibold"
      >
        Panel complet
      </button>
    </div>
  );
}
