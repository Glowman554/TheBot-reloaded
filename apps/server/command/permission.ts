import { supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import { BackupProvider, random_id } from "../backup/backup_provider.ts";
import { config } from "../config/config.ts";
import { log } from "../logger.ts";

const default_roles: string[] = [];

interface PermissionsStore {
	[key: string]: string[];
}

function load_permissions_file() {
	const permission_file = String(config.get("permissions_file"));
	const permissions = JSON.parse(Deno.readTextFileSync(permission_file)) as PermissionsStore;

	return permissions;
}

function save_permissions_file(permissions: PermissionsStore) {
	const permission_file = String(config.get("permissions_file"));
	Deno.writeTextFileSync(permission_file, JSON.stringify(permissions, null, "\t"));
}

export function check_permission(user: string, permission: string | undefined): boolean {
	if (permission == undefined) {
		return true;
	}

	const permissions = load_permissions_file();
	// log("debug", "permissions: " + JSON.stringify(permissions, null, "\t"));

	let loaded_user = permissions[user];
	// log("debug", "loaded_user: " + JSON.stringify(loaded_user, null, "\t"));
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = default_roles;
		loaded_user = default_roles;
		save_permissions_file(permissions);
	}

	for (let i = 0; i < loaded_user.length; i++) {
		const permissions_of_role = config.get(loaded_user[i], "permissions") as string[];
		if (permissions_of_role.includes(permission)) {
			return true;
		}
	}

	return false;
}

export function get_roles(user: string): string[] {
	log("debug", user);
	const permissions = load_permissions_file();

	let loaded_user = permissions[user];
	if (loaded_user == undefined) {
		log("permission", "creating new user: " + user);
		permissions[user] = default_roles;
		loaded_user = default_roles;
		save_permissions_file(permissions);
	}

	return loaded_user;
}

export function push_role(user: string, permission: string): void {
	const permissions = load_permissions_file();

	const loaded_user = permissions[user];
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
	const permissions = load_permissions_file();

	const loaded_user = permissions[user];
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
		const permission_file = String(config.get("permissions_file"));
		const permissions = JSON.parse(Deno.readTextFileSync(permission_file)) as { [key: string]: string[] };

		for (const i in permissions) {
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
