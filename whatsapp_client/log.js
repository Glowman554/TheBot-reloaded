import { send_to_server } from "./server.js";

export function log(msg) {
	send_to_server({
		id: 1,
		data: {
			message: msg,
			client_name: "whatsapp"
		}
	});
}