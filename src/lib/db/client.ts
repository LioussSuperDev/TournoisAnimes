import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { migrate } from "drizzle-orm/sqlite-proxy/migrator";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "tournoi.db");

declare global {
  var __sqlite: DatabaseSync | undefined;
}

const sqlite = globalThis.__sqlite ?? new DatabaseSync(dbPath);
if (process.env.NODE_ENV !== "production") {
  globalThis.__sqlite = sqlite;
}

// Next's build spawns several worker processes that each import this module
// to statically analyze route handlers, so multiple separate processes can
// end up opening/initializing the same fresh db file at once. Without a
// busy timeout, whichever one loses that race fails immediately with
// "database is locked" instead of just waiting the few ms for its turn.
sqlite.exec("PRAGMA busy_timeout = 5000;");
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA foreign_keys = ON;");

export const db = drizzle(async (sqlText, params, method) => {
  const stmt = sqlite.prepare(sqlText);
  if (method === "run") {
    stmt.run(...(params as never[]));
    return { rows: [] };
  }
  // Return rows as plain value arrays (column order), not name-keyed
  // objects: joins routinely select same-named columns from different
  // tables (e.g. two tables with `name`), and a named object silently
  // collapses those duplicates, shifting every field after them.
  stmt.setReturnArrays(true);
  if (method === "get") {
    const row = stmt.get(...(params as never[])) as unknown[] | undefined;
    // drizzle's sqlite-proxy `get` expects `rows` to BE the single row's
    // values directly (or a falsy value when no row matched) — NOT an
    // array wrapping it like `all` does. An empty array here is truthy,
    // so it would be (mis)treated as "a row with all-undefined columns".
    return { rows: row as unknown[] };
  }
  const rows = stmt.all(...(params as never[])) as unknown as unknown[][];
  return { rows };
}, { schema });

let migratedPromise: Promise<void> | null = null;
export function ensureMigrated() {
  if (!migratedPromise) {
    migratedPromise = migrate(
      db,
      async (queries) => {
        for (const q of queries) {
          sqlite.exec(q);
        }
      },
      { migrationsFolder: path.join(process.cwd(), "drizzle") }
    );
  }
  return migratedPromise;
}
