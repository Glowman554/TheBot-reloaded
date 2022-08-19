import { serve } from "https://deno.land/std/http/mod.ts";

import { to_server, from_server } from "./protocol.ts";
import { log } from "./logger.ts";

import { CommandEventImpl } from "./command/command_event_interface.ts";
import { command_manager, CommandEvent, Command, CommandExecutor, CommandResponse } from "./command/command.ts";

import { config } from "./config.ts";

async function handle_on_message_pkg(pkg: to_server.on_message_pkg, socket: WebSocket) {
	await from_server.send_message_ack(pkg.id, socket);

	var command_event = new CommandEventImpl(socket, pkg);
	await command_manager.on_command(new CommandEvent(command_event));
}

async function handle_log_pkg(pkg: to_server.log_pkg, socket: WebSocket) {
	log(pkg.client_name, pkg.message);
}

async function handle_config_request(pkg: to_server.config_request_pkg, socket: WebSocket) {
	await from_server.send_config_response(config.get(pkg.key, pkg.section), pkg.section, pkg.key, socket);
}

async function handle_pkg(pkg:to_server.pkg, socket: WebSocket) {
	switch (pkg.id) {
		case to_server.pkg_ids.on_message:
			await handle_on_message_pkg(pkg.data as to_server.on_message_pkg, socket);
			break;
		case to_server.pkg_ids.log:
			await handle_log_pkg(pkg.data as to_server.log_pkg, socket);
			break;
		case to_server.pkg_ids.config_request:
			await handle_config_request(pkg.data as to_server.config_request_pkg, socket);
			break;
		default:
			throw new Error(`Unknown package id: ${pkg.id}`);
	}
}

async function reqHandler(req: Request) {
	if (req.headers.get("upgrade") != "websocket") {
		log("server", "Invalid upgrade header");
		return new Response(null, { status: 501 });
	}

	const { socket: ws, response } = Deno.upgradeWebSocket(req);
	log("server", "New client connected");

	var client_authenticated = false;

	if (Boolean(config.get("log_packets"))) {
		var old_send = ws.send;
		ws.send = async (data: string | Blob | ArrayBufferView | ArrayBufferLike) => {
			log("pkg", "-> " + data);
			await old_send.call(ws, data);
		}
	}

	ws.onmessage = async (e) => {
		if (Boolean(config.get("log_packets"))) {
			log("pkg", "<- " + e.data);
		}

		if (!client_authenticated) {
			if (String(e.data).startsWith("auth:")) {
				var auth_data = String(e.data).substring(5);
				log("server", `Authenticating client using key ${auth_data}`);
				if (auth_data == config.get("ws_key")) {
					client_authenticated = true;
					log("server", "Client authenticated");
					await from_server.send_key_auth_response(true, ws);
				} else {
					log("server", "Client authentication failed");
					await from_server.send_key_auth_response(false, ws);
				}
			} else {
				log("server", "Invalid authentication data (" + String(e.data) + ")");
				await from_server.send_key_auth_response(false, ws);
			}
		} else {
			var pkg = JSON.parse(e.data) as to_server.pkg;
			try {
				await handle_pkg(pkg, ws);
			} catch (e) {
				log("error", "Oepsi woepsie: " + e);
				from_server.send_internal_error(String(e), pkg, ws);
			}
		}
	}
	return response;
}

function main() {
	config.parse();

	serve(reqHandler, { port: Number(config.get("port")) });

	command_manager.add_command(new Command("crash", "Crash the bot!", "Use '#crash' to crash the bot! (Admin only)", {
		execute: async (event: CommandEvent): Promise<CommandResponse> => {
			throw new Error("Crash!");
		}
	} as CommandExecutor, "crash"));

	command_manager.add_command(new Command("ping", "Ping the bot!", "Use '#ping' to ping the bot!", {
		execute: async (event: CommandEvent): Promise<CommandResponse> => {
			if (event.interface.args.length != 0) {
			}

			return {
				is_response: true,
				response: "Pong!"
			};
		}
	} as CommandExecutor, undefined));

	command_manager.add_command(new Command("say", "Say something to the chat!", "Use '#say <message>' to say something to the chat!", {
		execute: async (event: CommandEvent): Promise<CommandResponse> => {
			if (event.interface.args.length == 0) {
				return {
					is_response: true,
					response: "You need to specify a message!"
				};
			}

			return {
				is_response: true,
				response: event.interface.args.join(" ")
			};
		}
	} as CommandExecutor, undefined));
}

main();