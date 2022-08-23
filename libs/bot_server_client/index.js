import { to_server } from "./protocol.js";

export * as protocol from "./protocol.js";
export * as client from "./client.js";

var client_name = "default";
var remote_log = true;

/**
 * @param {string} name
 */
export function set_client_name(name) {
	client_name = name;
}

/**
 * @param {boolean} remote
 */
export function set_remote_log(remote) {
	remote_log = remote;
}

/**
 * @param {string} msg
 */
export function log(msg) {
	if (remote_log) {
		to_server.send_log(msg, client_name);
	} else {
		console.log(msg);
	}
}
