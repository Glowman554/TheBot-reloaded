import { to_server } from "bot_server_client/protocol.js";

var remote_log = false;

export function log(msg) {
	if (remote_log) {
		to_server.send_log(msg, "whatsapp");
	} else {
		console.log(msg);
	}
}

export function set_remote_log(remote) {
	remote_log = remote;
}
