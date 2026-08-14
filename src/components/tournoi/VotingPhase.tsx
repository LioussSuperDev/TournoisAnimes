"use client";

import { useState } from "react";
import clsx from "clsx";
import type { PlayerDuelView } from "@/lib/duel/viewTypes";

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
async function del(url: string) {
  const res = await fetch(url, { method: "DELETE" });
  return res.json();
}

export function VotingPhase({ view, meId, onChanged }: { view: PlayerDuelView; meId: string; onChanged: () => void }) {
  const [effaceurOpen, setEffaceurOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { duel } = view;
  if (!duel) return null;

  const locked = view.myVote?.validated ?? false;

  async function vote(endingId: string) {
    if (locked) return;
    setBusy(true);
    await post(`/api/duels/${duel!.id}/vote`, { endingId });
    setBusy(false);
    onChanged();
  }

  async function toggleValidate() {
    setBusy(true);
    await post(`/api/duels/${duel!.id}/vote/validate`, { validated: !locked });
    setBusy(false);
    onChanged();
  }

  async function activateEffaceur(targetUserId: string) {
    setBusy(true);
    await post(`/api/duels/${duel!.id}/powers/effaceur`, { targetUserId });
    setBusy(false);
    setEffaceurOpen(false);
    onChanged();
  }

  async function cancelEffaceur() {
    setBusy(true);
    await del(`/api/duels/${duel!.id}/powers/effaceur`);
    setBusy(false);
    onChanged();
  }

  async function activateBoost(endingId: string) {
    setBusy(true);
    await post(`/api/duels/${duel!.id}/powers/boost`, { endingId });
    setBusy(false);
    setBoostOpen(false);
    onChanged();
  }

  async function cancelBoost() {
    setBusy(true);
    await del(`/api/duels/${duel!.id}/powers/boost`);
    setBusy(false);
    onChanged();
  }

  async function toggleDoubleVote() {
    setBusy(true);
    await post(`/api/duels/${duel!.id}/powers/double-vote`, { activate: !view.myVote?.doubleVoteActive });
    setBusy(false);
    onChanged();
  }

  const endings = [duel.endingA, duel.endingB].filter(Boolean) as NonNullable<typeof duel.endingA>[];
  const opponents = view.votesStatus.filter((v) => v.userId !== meId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <p className="text-muted text-sm uppercase tracking-widest">{duel.groupName}</p>
        <h1 className="text-3xl font-black">Phase de vote</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {endings.map((e) => {
          const mine = view.myVote?.endingId === e.id;
          return (
            <button
              key={e.id}
              disabled={locked || busy}
              onClick={() => vote(e.id)}
              className={clsx(
                "rounded-2xl p-8 border-2 font-black text-2xl transition-all disabled:cursor-not-allowed",
                mine ? "scale-105 shadow-2xl" : "opacity-80 hover:opacity-100"
              )}
              style={{
                borderColor: e.color,
                background: mine ? e.color : "var(--surface)",
                color: mine ? "#000" : e.color,
              }}
            >
              {e.name}
              {mine && <div className="text-sm font-semibold mt-2">✓ ton vote</div>}
            </button>
          );
        })}
      </div>

      <button
        disabled={!view.myVote || busy}
        onClick={toggleValidate}
        className={clsx(
          "rounded-xl px-8 py-3 font-bold text-lg disabled:opacity-40",
          locked ? "bg-surface-2 border border-success text-success" : "bg-accent text-white"
        )}
      >
        {locked ? "Retirer ma validation" : "VALIDER MON VOTE"}
      </button>

      {/* Powers bar */}
      <div className="flex flex-wrap justify-center gap-3">
        <div className="relative">
          <button
            disabled={view.myPowers.effaceur === 0 || busy}
            onClick={() => setEffaceurOpen((v) => !v)}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm disabled:opacity-30"
          >
            L&apos;Effaceur ({view.myPowers.effaceur})
          </button>
          {effaceurOpen && (
            <div className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 shadow-2xl w-48">
              <p className="text-xs text-muted mb-2">Qui veux-tu cibler ?</p>
              {opponents.map((o) => (
                <button
                  key={o.userId}
                  onClick={() => activateEffaceur(o.userId)}
                  className="block w-full text-left rounded px-2 py-1 hover:bg-surface-2 text-sm"
                >
                  {o.username}
                </button>
              ))}
            </div>
          )}
          {view.myPending.effaceurTargetUserId && (
            <div className="mt-1 text-xs">
              <span className="rounded bg-danger/20 text-danger px-2 py-1">
                VOTE SUPPRIMÉ DE {view.myPending.effaceurTargetName}
              </span>{" "}
              <button onClick={cancelEffaceur} className="text-muted hover:underline">
                annuler
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            disabled={view.myPowers.boost === 0 || busy}
            onClick={() => setBoostOpen((v) => !v)}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm disabled:opacity-30"
          >
            Boost ({view.myPowers.boost})
          </button>
          {boostOpen && (
            <div className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 shadow-2xl w-48">
              <p className="text-xs text-muted mb-2">Quel ending booster ?</p>
              {endings.map((e) => (
                <button
                  key={e.id}
                  onClick={() => activateBoost(e.id)}
                  className="block w-full text-left rounded px-2 py-1 hover:bg-surface-2 text-sm"
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}
          {view.myPending.boostTargetEndingId && (
            <div className="mt-1 text-xs">
              <span className="rounded bg-accent/20 text-accent px-2 py-1">
                BOOST SUR{" "}
                {endings.find((e) => e.id === view.myPending.boostTargetEndingId)?.name}
              </span>{" "}
              <button onClick={cancelBoost} className="text-muted hover:underline">
                annuler
              </button>
            </div>
          )}
        </div>

        <button
          disabled={!view.myVote || view.myPowers.double_vote === 0 || busy}
          onClick={toggleDoubleVote}
          className={clsx(
            "rounded-lg border px-4 py-2 text-sm disabled:opacity-30",
            view.myVote?.doubleVoteActive
              ? "border-success text-success bg-success/10"
              : "border-border bg-surface-2"
          )}
        >
          Double Vote ({view.myPowers.double_vote}){view.myVote?.doubleVoteActive && " ✓"}
        </button>
      </div>

      <div className="flex gap-4 text-xs text-muted">
        {view.votesStatus.map((v) => (
          <span key={v.userId} className={v.validated ? "text-success" : ""}>
            {v.validated ? "✓" : "…"} {v.username}
          </span>
        ))}
      </div>
    </div>
  );
}
