"use client";

import { useState } from "react";
import type { Duel, Ending, Group } from "@/lib/types";

const PHASE_LABELS: Record<string, string> = {
  viewing: "Visionnage",
  voting: "Vote",
  powers_validation: "Pouvoirs / Validation",
  wheel: "Roue",
  result: "Résultat",
  post_powers: "Pouvoirs post-roue",
  done: "Terminé",
};
// Only these two are manually settable — the rest (validation, roue,
// résultat, post-pouvoirs) are driven automatically by the game actions
// (valider son vote, lancer la roue, Poulain d'Or/Remontada).
const MANUAL_PHASES = ["viewing", "voting"];

export function DuelsPanel({
  groups,
  endings,
  duels,
  onChanged,
}: {
  groups: Group[];
  endings: Ending[];
  duels: Duel[];
  onChanged: () => void;
}) {
  const [groupId, setGroupId] = useState("");
  const [endingAId, setEndingAId] = useState("");
  const [endingBId, setEndingBId] = useState("");
  const [busy, setBusy] = useState(false);

  const groupEndings = endings.filter((e) => e.groupId === groupId);
  const endingById = Object.fromEntries(endings.map((e) => [e.id, e]));
  const groupById = Object.fromEntries(groups.map((g) => [g.id, g]));

  async function create() {
    if (!groupId || !endingAId || !endingBId) return;
    setBusy(true);
    await fetch("/api/admin/duels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, endingAId, endingBId }),
    });
    setEndingAId("");
    setEndingBId("");
    setBusy(false);
    onChanged();
  }

  async function activate(id: string) {
    await fetch(`/api/admin/duels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate" }),
    });
    onChanged();
  }

  async function setPhase(id: string, phase: string) {
    await fetch(`/api/admin/duels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "phase", phase }),
    });
    onChanged();
  }

  async function setViewingStage(id: string, stage: "a" | "b" | "free") {
    await fetch(`/api/admin/duels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "viewingStage", stage }),
    });
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce duel ?")) return;
    await fetch(`/api/admin/duels/${id}`, { method: "DELETE" });
    onChanged();
  }

  async function forceSpin(id: string) {
    await fetch(`/api/duels/${id}/spin`, { method: "POST" });
    onChanged();
  }

  async function finalize(id: string) {
    await fetch(`/api/admin/duels/${id}/finalize`, { method: "POST" });
    onChanged();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-bold mb-3">Duels</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <select
          value={groupId}
          onChange={(e) => {
            setGroupId(e.target.value);
            setEndingAId("");
            setEndingBId("");
          }}
          className="rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm"
        >
          <option value="">Groupe...</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          value={endingAId}
          onChange={(e) => setEndingAId(e.target.value)}
          className="rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm"
        >
          <option value="">Ending A...</option>
          {groupEndings.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <select
          value={endingBId}
          onChange={(e) => setEndingBId(e.target.value)}
          className="rounded-lg bg-surface-2 border border-border px-2 py-1.5 text-sm"
        >
          <option value="">Ending B...</option>
          {groupEndings.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <button
          onClick={create}
          disabled={busy}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
        >
          Créer le duel
        </button>
      </div>

      <ul className="space-y-2">
        {duels.map((d) => (
          <li key={d.id} className="rounded-lg bg-surface-2 px-3 py-2 text-sm space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span>
                <strong>{groupById[d.groupId]?.name}</strong> — {endingById[d.endingAId]?.name} vs{" "}
                {endingById[d.endingBId]?.name}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={
                    d.status === "active"
                      ? "text-success"
                      : d.status === "completed"
                        ? "text-muted"
                        : "text-accent-2"
                  }
                >
                  {d.status}
                </span>
                {d.status !== "active" && (
                  <button
                    onClick={() => activate(d.id)}
                    className="rounded bg-accent px-2 py-1 text-xs font-semibold"
                  >
                    Activer
                  </button>
                )}
                <button onClick={() => remove(d.id)} className="text-danger hover:underline text-xs">
                  supprimer
                </button>
              </div>
            </div>
            {d.status === "active" && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-muted mr-1">Phase actuelle : {PHASE_LABELS[d.phase]}</span>
                {MANUAL_PHASES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPhase(d.id, p)}
                    className={`rounded px-2 py-1 text-xs border ${
                      d.phase === p
                        ? "bg-accent-2 text-black border-accent-2 font-semibold"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {PHASE_LABELS[p]}
                  </button>
                ))}
                {d.phase === "viewing" && (
                  <span className="flex items-center gap-1 ml-1 border-l border-border pl-2">
                    <span className="text-[10px] text-muted mr-0.5">Vidéo :</span>
                    {(
                      [
                        { key: "a" as const, label: endingById[d.endingAId]?.name ?? "A" },
                        { key: "b" as const, label: endingById[d.endingBId]?.name ?? "B" },
                        { key: "free" as const, label: "Libre" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setViewingStage(d.id, s.key)}
                        className={`rounded px-2 py-1 text-xs border ${
                          d.viewingStage === s.key
                            ? "bg-accent-2 text-black border-accent-2 font-semibold"
                            : "border-border text-muted hover:text-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </span>
                )}
                {(d.phase === "voting" || d.phase === "powers_validation") && (
                  <button
                    onClick={() => forceSpin(d.id)}
                    className="rounded px-2 py-1 text-xs border border-accent text-accent hover:bg-accent hover:text-white"
                  >
                    Lancer la roue
                  </button>
                )}
                {(d.phase === "result" || d.phase === "post_powers") && (
                  <button
                    onClick={() => finalize(d.id)}
                    className="rounded px-2 py-1 text-xs border border-success text-success hover:bg-success hover:text-black"
                  >
                    Terminer le duel
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
        {duels.length === 0 && <li className="text-muted text-sm">Aucun duel.</li>}
      </ul>
    </div>
  );
}
