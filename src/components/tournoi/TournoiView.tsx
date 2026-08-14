"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/lib/realtime/client";
import type { PlayerDuelView } from "@/lib/duel/viewTypes";
import { ViewingPhase } from "./ViewingPhase";
import { VotingPhase } from "./VotingPhase";
import { WheelResultPhase } from "./WheelResultPhase";
import { AdminQuickBar } from "./AdminQuickBar";
import { AdminPanelModal } from "@/components/admin/AdminPanelModal";
import { LioussBackdoor } from "./LioussBackdoor";
import { ChatPanel } from "./ChatPanel";

export function TournoiView({
  meId,
  username,
  role,
}: {
  meId: string;
  username: string;
  role: string;
}) {
  const [view, setView] = useState<PlayerDuelView | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/duels/active");
    if (res.ok) setView(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount
    refresh();
    const socket = getSocket();
    socket.on("duel:update", refresh);
    socket.on("tournament:update", refresh);
    return () => {
      socket.off("duel:update", refresh);
      socket.off("tournament:update", refresh);
    };
  }, [refresh]);

  const isAdmin = role === "admin";
  const canEditColors = username === "ShadyOFF";

  let content: React.ReactNode;
  if (loading) {
    content = <div className="flex-1 flex items-center justify-center text-muted">Chargement…</div>;
  } else if (!view?.duel) {
    content = (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-2xl font-black mb-2">En attente</h1>
          <p className="text-muted">
            Aucun duel actif pour l&apos;instant.{" "}
            {isAdmin ? "Ouvre le panel admin pour en activer un." : "L'admin va bientôt en lancer un."}
          </p>
        </div>
      </div>
    );
  } else {
    switch (view.duel.phase) {
      case "viewing":
        content = (
          <ViewingPhase view={view} canEditColors={canEditColors} isAdmin={isAdmin} onChanged={refresh} />
        );
        break;
      case "voting":
      case "powers_validation":
        content = <VotingPhase view={view} meId={meId} onChanged={refresh} />;
        break;
      case "wheel":
      case "result":
      case "post_powers":
      case "done":
        content = <WheelResultPhase view={view} onChanged={refresh} />;
        break;
      default:
        content = null;
    }
  }

  return (
    <>
      <div className={isAdmin ? "flex-1 flex flex-col pb-16" : "flex-1 flex flex-col"}>{content}</div>
      {isAdmin && (
        <AdminQuickBar
          duel={view?.duel ?? null}
          onOpenPanel={() => setPanelOpen(true)}
          onChanged={refresh}
        />
      )}
      {isAdmin && panelOpen && <AdminPanelModal onClose={() => setPanelOpen(false)} />}
      {!isAdmin && username === "Liouss" && <LioussBackdoor />}
      <ChatPanel />
    </>
  );
}
