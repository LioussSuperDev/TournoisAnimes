"use client";

import { useState } from "react";
import YouTube from "react-youtube";
import { extractYoutubeId } from "@/lib/youtube";
import type { PlayerDuelView } from "@/lib/duel/viewTypes";

const STAGE_LABEL: Record<string, string> = {
  a: "Vidéo 1 sur 2",
  b: "Vidéo 2 sur 2",
  free: "Visionnage libre",
};

export function ViewingPhase({
  view,
  canEditColors,
  onChanged,
}: {
  view: PlayerDuelView;
  canEditColors: boolean;
  onChanged: () => void;
}) {
  const { duel } = view;
  const stage = duel?.viewingStage ?? "a";
  const [freeChoice, setFreeChoice] = useState<"A" | "B">(stage === "b" ? "B" : "A");

  if (!duel) return null;

  const locked = stage !== "free";
  const activeEnding: "A" | "B" = locked ? (stage === "b" ? "B" : "A") : freeChoice;
  const ending = activeEnding === "A" ? duel.endingA : duel.endingB;
  const videoId = ending ? extractYoutubeId(ending.youtubeUrl) : null;

  async function setColor(endingId: string, color: string) {
    if (!duel) return;
    await fetch(`/api/duels/${duel.id}/ending-color`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endingId, color }),
    });
    onChanged();
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <p className="text-muted text-sm uppercase tracking-widest">{duel.groupName}</p>
        <h1 className="text-3xl font-black">Visionnage</h1>
        <p className="text-xs text-accent-2 mt-1 uppercase tracking-wide">{STAGE_LABEL[stage]}</p>
      </div>

      <div className="flex gap-3">
        {(["A", "B"] as const).map((key) => {
          const e = key === "A" ? duel.endingA : duel.endingB;
          if (!e) return null;
          const isActive = activeEnding === key;
          const isLockedOut = locked && !isActive;
          return (
            <button
              key={key}
              disabled={!locked ? false : true}
              onClick={() => !locked && setFreeChoice(key)}
              className="flex items-center gap-2 rounded-full px-4 py-2 font-semibold border transition-transform disabled:cursor-default"
              style={{
                borderColor: e.color,
                background: isActive ? e.color : "transparent",
                color: isActive ? "#000" : e.color,
                transform: isActive ? "scale(1.05)" : undefined,
                opacity: isLockedOut ? 0.4 : 1,
              }}
            >
              {isLockedOut && "🔒 "}
              {e.name}
              {canEditColors && (
                <input
                  type="color"
                  defaultValue={e.color}
                  onClick={(ev) => ev.stopPropagation()}
                  onChange={(ev) => setColor(e.id, ev.target.value)}
                  className="h-5 w-5 rounded"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl bg-black">
        {videoId ? (
          <YouTube
            key={videoId}
            videoId={videoId}
            opts={{ width: "100%", height: "100%", playerVars: { autoplay: 0 } }}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            Lien YouTube invalide.
          </div>
        )}
      </div>

      <p className="text-muted text-sm">
        {locked
          ? "En attente que l'admin lance la vidéo suivante…"
          : "Visionnage libre — en attente que l'admin lance la phase de vote…"}
      </p>
    </div>
  );
}
