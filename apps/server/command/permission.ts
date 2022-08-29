import { supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import { BackupProvider, random_id } from "../backup/backup_provider.ts";
import { config } from "../config/config.ts";
import { log } from "../logger.ts";

var default_roles: string[] = [];

export function check_permission(user: string, permission: string | undefined): boolean {
	if (permission == undefined) {
		return true;
	}

	var permission_file = String(config.get("permissions_file"));
	var permissions = JSON.parse(Deno.readTextFileSync(permission_file)) as { [key: string]: string[] };
	// log("debug", "permissions: " + JSON.stringify(permissions, null, "\t"));

	var loaded_user = permissions[user];
	// log("debug", "loaded_user: " + JSON.stringify(loaded_user, null, "\t"));
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = default_roles;
		loaded_user = default_roles;
		Deno.writeTextFileSync(permission_file, JSON.stringify(permissions, null, "\t"));
	}

	for (var i = 0; i < loaded_user.length; i++) {
		var permissions_of_role = config.get(loaded_user[i], "permissions") as string[];
		if (permissions_of_role.includes(permission)) {
			return true;
		}
	}

	return false;
}

export class PermissionsBackup implements BackupProvider {
	get_table_name() {
		return "permissions";
	}

	async backup(table: supabaseTable, id: number): Promise<void> {
		var permission_file = String(config.get("permissions_file"));
		var permissions = JSON.parse(Deno.readTextFileSync(permission_file)) as { [key: string]: string[] };

		for (let i in permissions) {
			log("permissions", "backing up: " + i);
			await table.items().add({
				id: random_id(),
				backup_id: id,
				user: i,
				roles: permissions[i],
			});
		}
	}
}
