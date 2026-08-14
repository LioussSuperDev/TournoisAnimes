CREATE TABLE `action_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`type` text NOT NULL,
	`payload_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `duels` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`ending_a_id` text NOT NULL,
	`ending_b_id` text NOT NULL,
	`phase` text DEFAULT 'viewing' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`winner_ending_id` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ending_a_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ending_b_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `endings` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`youtube_url` text NOT NULL,
	`color` text DEFAULT '#6366f1' NOT NULL,
	`qualified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loser_bracket_entries` (
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
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_powers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`power_type` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_powers_user_type_idx` ON `player_powers` (`user_id`,`power_type`);--> statement-breakpoint
CREATE TABLE `power_usages` (
	`id` text PRIMARY KEY NOT NULL,
	`duel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`power_type` text NOT NULL,
	`target_user_id` text,
	`target_ending_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`username_lower` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'player' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_lower_idx` ON `users` (`username_lower`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`duel_id` text NOT NULL,
	`user_id` text NOT NULL,
	`ending_id` text NOT NULL,
	`validated` integer DEFAULT false NOT NULL,
	`double_vote_active` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_duel_user_idx` ON `votes` (`duel_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `wheel_spins` (
	`id` text PRIMARY KEY NOT NULL,
	`duel_id` text NOT NULL,
	`segments_json` text NOT NULL,
	`winner_segment_index` integer NOT NULL,
	`winner_ending_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`duel_id`) REFERENCES `duels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winner_ending_id`) REFERENCES `endings`(`id`) ON UPDATE no action ON DELETE no action
);
