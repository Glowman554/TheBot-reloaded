import { log } from "../logger.ts";

export function check_permission(user: string, permission: string|undefined): boolean {
	// TODO: implement permissions
	log("WARNING", "Not implemented yet");
	return !(permission == "blacklist");
}