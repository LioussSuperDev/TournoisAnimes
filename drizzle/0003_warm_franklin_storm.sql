PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_loser_bracket_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ending_id` text NOT NULL,
	`group_id_origin` text NOT NULL,
	`youtube_url` text NOT NULL,
	`duel_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id_origin`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_loser_bracket_entries`("id", "user_id", "ending_id", "group_id_origin", "youtube_url", "duel_id", "created_at") SELECT "id", "user_id", "ending_id", "group_id_origin", "youtube_url", "duel_id", "created_at" FROM `loser_bracket_entries`;--> statement-breakpoint
DROP TABLE `loser_bracket_entries`;--> statement-breakpoint
ALTER TABLE `__new_loser_bracket_entries` RENAME TO `loser_bracket_entries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_power_usages` (
	`id` text PRIMARY KEY NOT NULL,
	`duel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`power_type` text NOT NULL,
	`target_user_id` text,
	`target_ending_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_power_usages`("id", "duel_id", "user_id", "power_type", "target_user_id", "target_ending_id", "status", "created_at") SELECT "id", "duel_id", "user_id", "power_type", "target_user_id", "target_ending_id", "status", "created_at" FROM `power_usages`;--> statement-breakpoint
DROP TABLE `power_usages`;--> statement-breakpoint
ALTER TABLE `__new_power_usages` RENAME TO `power_usages`;--> statement-breakpoint
CREATE TABLE `__new_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`duel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`ending_id` text NOT NULL,
	`validated` integer DEFAULT false NOT NULL,
	`double_vote_active` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_votes`("id", "duel_id", "user_id", "ending_id", "validated", "double_vote_active", "created_at", "updated_at") SELECT "id", "duel_id", "user_id", "ending_id", "validated", "double_vote_active", "created_at", "updated_at" FROM `votes`;--> statement-breakpoint
DROP TABLE `votes`;--> statement-breakpoint
ALTER TABLE `__new_votes` RENAME TO `votes`;--> statement-breakpoint
CREATE UNIQUE INDEX `votes_duel_user_idx` ON `votes` (`duel_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `__new_wheel_spins` (
	`id` text PRIMARY KEY NOT NULL,
	`duel_id` text NOT NULL,
	`segments_json` text NOT NULL,
	`winner_segment_index` integer NOT NULL,
	`winner_ending_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`winner_ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_wheel_spins`("id", "duel_id", "segments_json", "winner_segment_index", "winner_ending_id", "created_at") SELECT "id", "duel_id", "segments_json", "winner_segment_index", "winner_ending_id", "created_at" FROM `wheel_spins`;--> statement-breakpoint
DROP TABLE `wheel_spins`;--> statement-breakpoint
ALTER TABLE `__new_wheel_spins` RENAME TO `wheel_spins`;