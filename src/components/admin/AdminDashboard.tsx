"use client";

import { useCallback, useEffect, useState } from "react";
import { getSocket } from "@/lib/realtime/client";
import type { Duel, Ending, Group, PlayerPower, User } from "@/lib/types";
import { GroupsPanel } from "./GroupsPanel";
import { EndingsPanel } from "./EndingsPanel";
import { DuelsPanel } from "./DuelsPanel";
import { PowersPanel } from "./PowersPanel";
import { LoserBracketPanel } from "./LoserBracketPanel";
import { PoulainDorPanel } from "./PoulainDorPanel";
import { HistoryPanel } from "./HistoryPanel";
import { SnapshotsPanel } from "./SnapshotsPanel";
import { AccountsPanel } from "./AccountsPanel";

export function AdminDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [endings, setEndings] = useState<Ending[]>([]);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [powers, setPowers] = useState<PlayerPower[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [loserBracket, setLoserBracket] = useState<
    Parameters<typeof LoserBracketPanel>[0]["entries"]
  >([]);
  const [poulainDor, setPoulainDor] = useState<Parameters<typeof PoulainDorPanel>[0]["usages"]>([]);
  const [history, setHistory] = useState<Parameters<typeof HistoryPanel>[0]["history"]>([]);
  const [snapshots, setSnapshots] = useState<Parameters<typeof SnapshotsPanel>[0]["snapshots"]>(
    []
  );

  const refresh = useCallback(async () => {
    const [g, e, d, p, presence, lb, pd, h, sn] = await Promise.all([
      fetch("/api/admin/groups").then((r) => r.json()),
      fetch("/api/admin/endings").then((r) => r.json()),
      fetch("/api/admin/duels").then((r) => r.json()),
      fetch("/api/admin/powers").then((r) => r.json()),
      fetch("/api/presence").then((r) => r.json()),
      fetch("/api/admin/loser-bracket").then((r) => r.json()),
      fetch("/api/admin/poulain-dor").then((r) => r.json()),
      fetch("/api/admin/history").then((r) => r.json()),
      fetch("/api/admin/snapshots").then((r) => r.json()),
    ]);
    setGroups(g.groups ?? []);
    setEndings(e.endings ?? []);
    setDuels(d.duels ?? []);
    setPowers(p.powers ?? []);
    setPlayers(presence.users ?? []);
    setLoserBracket(lb.entries ?? []);
    setPoulainDor(pd.usages ?? []);
    setHistory(h.history ?? []);
    setSnapshots(sn.snapshots ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount
    refresh();
    const socket = getSocket();
    const events = ["tournament:update", "duel:update", "loser-bracket:update"];
    for (const evt of events) socket.on(evt, refresh);
    return () => {
      for (const evt of events) socket.off(evt, refresh);
    };
  }, [refresh]);

  return (
    <div className="grid gap-4 max-w-5xl mx-auto">
      <GroupsPanel groups={groups} onChanged={refresh} />
      <EndingsPanel groups={groups} endings={endings} onChanged={refresh} />
      <DuelsPanel groups={groups} endings={endings} duels={duels} onChanged={refresh} />
      <AccountsPanel players={players} />
      <PowersPanel players={players} powers={powers} onChanged={refresh} />
      <LoserBracketPanel entries={loserBracket} players={players} />
      <PoulainDorPanel usages={poulainDor} />
      <HistoryPanel history={history} />
      <SnapshotsPanel snapshots={snapshots} onChanged={refresh} />
    </div>
  );
}
