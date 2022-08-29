import { supabaseClient, supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import { PermissionsBackup } from "../command/permission.ts";
import { config } from "../config/config.ts";
import { log } from "../logger.ts";

export interface BackupProvider {
	backup(table: supabaseTable, id: number): Promise<void>;
	get_table_name(): string;
}

export async function backup() {
	if (!(config.get("enabled", "backup") as any)) {
		return;
	}

	var client = new supabaseClient(config.get("url", "backup") as string, config.get("token", "backup") as string);

	var providers: BackupProvider[] = [
		config,
		new PermissionsBackup(),
	];

	var backup_id = random_id();
	log("backup", "Starting backup with id " + backup_id);

	for (let provider of providers) {
		var table_name = provider.get_table_name();
		log("backup", "Creating backup for " + table_name);
		await provider.backup(client.tables().get(table_name), backup_id);
	}

	await client.tables().get("backups").items().add({
		id: backup_id,
	});

	log("backup", "Done!");
}

export function random_id() {
	return Math.floor(Math.random() * 10000000000000);
}
