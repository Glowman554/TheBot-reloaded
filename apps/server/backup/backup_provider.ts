import { supabaseClient, supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import { PermissionsBackup } from "../command/permission.ts";
import { config } from "../config/config.ts";
import { KeystoreBackup } from "../config/keystore.ts";
import { log } from "../logger.ts";

export interface BackupProvider {
	backup(table: supabaseTable, id: number): Promise<void>;
	get_table_name(): string;
}

export async function backup() {
	// deno-lint-ignore no-explicit-any
	if (!(config.get("enabled", "backup") as any)) {
		return;
	}

	const client = new supabaseClient(config.get("url", "backup") as string, config.get("token", "backup") as string);

	const providers: BackupProvider[] = [
		config,
		new PermissionsBackup(),
		new KeystoreBackup()
	];

	const backup_id = random_id();
	log("backup", "Starting backup with id " + backup_id);

	const scheduled_for_delete = (await client.tables().get("backups").items().all() as { when: string | number; id: number }[]).map((x) => {
		x.when = new Date(x.when).getTime();
		return x;
	}).sort((a, b) => {
		if (a.when < b.when) {
			return -1;
		}
		if (a.when > b.when) {
			return 1;
		}
		return 0;
	}).map((x) => x.id);
	scheduled_for_delete.pop();

	log("backup", "Going to delete " + scheduled_for_delete.join(", "));

	for (const provider of providers) {
		const table_name = provider.get_table_name();
		const table = client.tables().get(table_name);

		for (const i of scheduled_for_delete) {
			await table.items().delete("backup_id", i);
		}

		log("backup", "Creating backup for " + table_name);
		await provider.backup(table, backup_id);
	}

	await client.tables().get("backups").items().add({
		id: backup_id,
	});

	for (const i of scheduled_for_delete) {
		await client.tables().get("backups").items().delete("id", i);
	}

	log("backup", "Done!");
}

export function random_id() {
	return Math.floor(Math.random() * 10000000000000);
}
