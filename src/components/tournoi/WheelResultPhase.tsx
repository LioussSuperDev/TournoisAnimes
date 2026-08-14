"use client";

import { useState } from "react";
import { Wheel } from "@/components/wheel/Wheel";
import type { PlayerDuelView } from "@/lib/duel/viewTypes";

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export function WheelResultPhase({ view, onChanged }: { view: PlayerDuelView; onChanged: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const { duel, wheel } = view;
  if (!duel || !wheel) return null;

  const endingsById: Record<string, { name: string; color: string }> = {};
  if (duel.endingA) endingsById[duel.endingA.id] = duel.endingA;
  if (duel.endingB) endingsById[duel.endingB.id] = duel.endingB;

  const segmentDisplays = wheel.segments.map((s) => ({
    endingId: s.endingId,
    label: endingsById[s.endingId]?.name ?? "?",
    color: s.color,
  }));

  const winnerEnding = endingsById[wheel.winnerEndingId];
  const loserEndingId =
    duel.endingA && duel.winnerEndingId === duel.endingA.id ? duel.endingB?.id : duel.endingA?.id;
  const loserEnding = loserEndingId ? endingsById[loserEndingId] : undefined;

  async function relance() {
    setBusy(true);
    setRevealed(false);
    await post(`/api/duels/${duel!.id}/relance`);
    setBusy(false);
    onChanged();
  }

  async function usePoulainDor() {
    if (!loserEndingId) return;
    setBusy(true);
    await post(`/api/duels/${duel!.id}/poulain-dor`, { savedEndingId: loserEndingId });
    setBusy(false);
    onChanged();
  }

  async function useRemontada() {
    if (!loserEndingId) return;
    setBusy(true);
    await post(`/api/duels/${duel!.id}/remontada`, { losingEndingId: loserEndingId });
    setBusy(false);
    onChanged();
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <p className="text-muted text-sm uppercase tracking-widest">{duel.groupName}</p>
        <h1 className="text-3xl font-black">La Roue</h1>
      </div>

      <Wheel
        segments={segmentDisplays}
        winnerIndex={wheel.winnerSegmentIndex}
        spinToken={wheel.spinId}
        onSpinEnd={() => setRevealed(true)}
        size={480}
      />

      {revealed && winnerEnding && (
        <div className="text-center animate-[tick_0.6s_ease]">
          <p className="text-muted">Résultat</p>
          <p className="text-4xl font-black" style={{ color: winnerEnding.color }}>
            {winnerEnding.name}
          </p>
        </div>
      )}

      {revealed && (
        <div className="flex flex-wrap justify-center gap-3">
          {view.canRelaunch && view.myPowers.relance_roue > 0 && (
            <button
              disabled={busy}
              onClick={relance}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold"
            >
              Relancer la roue ({view.myPowers.relance_roue})
            </button>
          )}
          {loserEnding && (
            <>
              <button
                disabled={busy || view.myPowers.poulain_dor === 0}
                onClick={usePoulainDor}
                className="rounded-lg border border-amber-400 text-amber-300 px-4 py-2 text-sm font-semibold disabled:opacity-30"
              >
                Poulain d&apos;Or sur {loserEnding.name} ({view.myPowers.poulain_dor})
              </button>
              <button
                disabled={busy || view.myPowers.remontada === 0}
                onClick={useRemontada}
                className="rounded-lg border border-accent-2 text-accent-2 px-4 py-2 text-sm font-semibold disabled:opacity-30"
              >
                Remontada sur {loserEnding.name} ({view.myPowers.remontada})
              </button>
            </>
          )}
        </div>
      )}

      {revealed && view.postWheelUsages.length > 0 && (
        <div className="text-xs text-muted text-center">
          {view.postWheelUsages.map((u) => (
            <div key={u.id}>
              {u.username} — {u.powerType === "poulain_dor" ? "Poulain d'Or" : "Remontada"}
              {u.targetEndingId && ` sur ${endingsById[u.targetEndingId]?.name}`}
            </div>
          ))}
        </div>
      )}

      <p className="text-muted text-sm">En attente que l&apos;admin termine le duel…</p>
    </div>
  );
}
