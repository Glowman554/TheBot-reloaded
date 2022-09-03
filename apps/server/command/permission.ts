import { supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import { BackupProvider, random_id } from "../backup/backup_provider.ts";
import { config } from "../config/config.ts";
import { log } from "../logger.ts";

var default_roles: string[] = [];

interface PermissionsStore {
	[key: string]: string[];
}

function load_permissions_file() {
	var permission_file = String(config.get("permissions_file"));
	var permissions = JSON.parse(Deno.readTextFileSync(permission_file)) as PermissionsStore;

	return permissions;
}

function save_permissions_file(permissions: PermissionsStore) {
	var permission_file = String(config.get("permissions_file"));
	Deno.writeTextFileSync(permission_file, JSON.stringify(permissions, null, "\t"));
}

export function check_permission(user: string, permission: string | undefined): boolean {
	if (permission == undefined) {
		return true;
	}

	var permissions = load_permissions_file();
	// log("debug", "permissions: " + JSON.stringify(permissions, null, "\t"));

	var loaded_user = permissions[user];
	// log("debug", "loaded_user: " + JSON.stringify(loaded_user, null, "\t"));
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = default_roles;
		loaded_user = default_roles;
		save_permissions_file(permissions);
	}

	for (var i = 0; i < loaded_user.length; i++) {
		var permissions_of_role = config.get(loaded_user[i], "permissions") as string[];
		if (permissions_of_role.includes(permission)) {
			return true;
		}
	}

	return false;
}

export function get_roles(user: string): string[] {
	log("debug", user);
	var permissions = load_permissions_file();

	var loaded_user = permissions[user];
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = default_roles;
		loaded_user = default_roles;
		save_permissions_file(permissions);
	}

	return loaded_user;
}

export function push_role(user: string, permission: string): void {
	var permissions = load_permissions_file();

	var loaded_user = permissions[user];
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = [
			...default_roles,
			...[permission],
		];
		save_permissions_file(permissions);
	} else {
		loaded_user.push(permission);
		save_permissions_file(permissions);
	}
}

export function remove_role(user: string, permission: string): void {
	var permissions = load_permissions_file();

	var loaded_user = permissions[user];
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = default_roles;
		save_permissions_file(permissions);
	} else {
		loaded_user.splice(loaded_user.indexOf(permission), 1);
		save_permissions_file(permissions);
	}
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
