import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import {
  groups,
  endings,
  duels,
  votes,
  powerUsages,
  wheelSpins,
  loserBracketEntries,
  playerPowers,
  tournamentSnapshots,
} from "../schema";

interface SnapshotData {
  groups: (typeof groups.$inferSelect)[];
  endings: (typeof endings.$inferSelect)[];
  duels: (typeof duels.$inferSelect)[];
  votes: (typeof votes.$inferSelect)[];
  powerUsages: (typeof powerUsages.$inferSelect)[];
  wheelSpins: (typeof wheelSpins.$inferSelect)[];
  loserBracketEntries: (typeof loserBracketEntries.$inferSelect)[];
  playerPowers: (typeof playerPowers.$inferSelect)[];
}

export function listSnapshots() {
  return db
    .select({
      id: tournamentSnapshots.id,
      name: tournamentSnapshots.name,
      createdAt: tournamentSnapshots.createdAt,
    })
    .from(tournamentSnapshots)
    .orderBy(desc(tournamentSnapshots.createdAt))
    .all();
}

export async function createSnapshot(name: string) {
  const [g, e, d, v, pu, ws, lb, pp] = await Promise.all([
    db.select().from(groups).all(),
    db.select().from(endings).all(),
    db.select().from(duels).all(),
    db.select().from(votes).all(),
    db.select().from(powerUsages).all(),
    db.select().from(wheelSpins).all(),
    db.select().from(loserBracketEntries).all(),
    db.select().from(playerPowers).all(),
  ]);

  const data: SnapshotData = {
    groups: g,
    endings: e,
    duels: d,
    votes: v,
    powerUsages: pu,
    wheelSpins: ws,
    loserBracketEntries: lb,
    playerPowers: pp,
  };

  const [snapshot] = await db
    .insert(tournamentSnapshots)
    .values({ name, dataJson: JSON.stringify(data) })
    .returning();
  return snapshot;
}

export async function loadSnapshot(id: string) {
  const row = await db
    .select()
    .from(tournamentSnapshots)
    .where(eq(tournamentSnapshots.id, id))
    .get();
  if (!row) throw new Error("Sauvegarde introuvable.");
  const data = JSON.parse(row.dataJson) as SnapshotData;

  await db.transaction(async (tx) => {
    // children first (FK order), then parents, then children back in
    await tx.delete(votes);
    await tx.delete(powerUsages);
    await tx.delete(wheelSpins);
    await tx.delete(loserBracketEntries);
    await tx.delete(duels);
    await tx.delete(endings);
    await tx.delete(groups);
    await tx.delete(playerPowers);

    if (data.groups.length) await tx.insert(groups).values(data.groups);
    if (data.endings.length) await tx.insert(endings).values(data.endings);
    if (data.duels.length) await tx.insert(duels).values(data.duels);
    if (data.playerPowers.length) await tx.insert(playerPowers).values(data.playerPowers);
    if (data.votes.length) await tx.insert(votes).values(data.votes);
    if (data.powerUsages.length) await tx.insert(powerUsages).values(data.powerUsages);
    if (data.wheelSpins.length) await tx.insert(wheelSpins).values(data.wheelSpins);
    if (data.loserBracketEntries.length)
      await tx.insert(loserBracketEntries).values(data.loserBracketEntries);
  });

  return row;
}

export async function deleteSnapshot(id: string) {
  await db.delete(tournamentSnapshots).where(eq(tournamentSnapshots.id, id));
}
