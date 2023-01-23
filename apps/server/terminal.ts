import { from_server, to_server } from "./protocol.ts";
import * as readline from "https://deno.land/x/readline@v1.1.0/mod.ts";

let ws: WebSocket;

function log(msg: string) {
	to_server.send_log(msg, "terminal", ws);
}

function on_line(line: string) {
	to_server.send_on_message(line, "terminal", "terminal", [], undefined, undefined, 10, ws);
	input();
}

function uint8_to_string(uint8array: Uint8Array): string {
	return new TextDecoder().decode(uint8array);
}

const rl = readline.readline(Deno.stdin);

function input() {
	rl.next().then((line) => on_line(uint8_to_string(line.value).replaceAll("\r", "")));
}

function main() {
	ws = new WebSocket("ws://localhost:8080");
	ws.onopen = () => {
		ws.send("auth:" + prompt("key >"));
		log("Connected");
		input();
	};
	ws.onmessage = (event) => {
		const pkg = JSON.parse(event.data) as from_server.pkg;
		switch (pkg.id) {
			case from_server.pkg_ids.internal_error_pkg:
				console.log(pkg.data.message);
				break;
			case from_server.pkg_ids.message_send:
				console.log(pkg.data.message);
				break;
			case from_server.pkg_ids.key_auth_response:
				console.log("Auth success: " + pkg.data.success);
				if (!pkg.data.success) {
					Deno.exit(1);
				}
				break;
		}
	};
}

main();
