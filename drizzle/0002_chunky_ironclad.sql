CREATE TABLE `tournament_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data_json` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
