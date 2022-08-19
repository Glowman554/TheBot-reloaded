import { to_server } from "bot_server_client/protocol.js";

export function log(msg) {
	to_server.send_log(msg, "whatsapp");
}