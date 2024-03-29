import { serve } from "https://deno.land/std@0.173.0/http/mod.ts";

import { from_server, to_server } from "./protocol.ts";
import { log } from "./logger.ts";

import { CommandEventImpl } from "./command/command_event_interface.ts";
import { command_manager, CommandEvent, init_command_manager } from "./command/command.ts";

import { config, init_config } from "./config/config.ts";

import { load_all_loadables } from "./loadable.ts";
import { get_temp_file, init_tmp_files } from "./utils/tmp.ts";
import { create, ErrorMode, set_logger } from "https://deno.land/x/simple_router@0.7/mod.ts";
import { v1 } from "./api/version/v1.ts";
import { backup } from "./backup/backup_provider.ts";
import { event } from "./event/event.ts";
import { EventHandler } from "./event/event_handler.ts";
import { keystore_load } from "./config/keystore.ts";

async function handle_on_message_pkg(pkg: to_server.on_message_pkg, socket: WebSocket) {
	await from_server.send_message_ack(pkg.id, socket);

	const command_event = new CommandEventImpl(socket, pkg);

	await event.handle<to_server.on_message_pkg>("on_message", pkg);

	const ce = new CommandEvent(command_event);
	await event.handle<CommandEvent>("on_message_ce", ce);

	await command_manager.on_command(ce);
}

function handle_log_pkg(pkg: to_server.log_pkg, _socket: WebSocket) {
	log(pkg.client_name, pkg.message);
}

async function handle_config_request(pkg: to_server.config_request_pkg, socket: WebSocket) {
	await from_server.send_config_response(config.get(pkg.key, pkg.section), pkg.section, pkg.key, socket);
}

async function handle_tmp_file_request(pkg: to_server.tmp_file_request_pkg, socket: WebSocket) {
	const file = get_temp_file(pkg.ext, pkg.ttl);
	await from_server.send_tmp_file_response(Deno.realPathSync(file.split("/").slice(0, -1).join("/")) + "/" + file.split("/").pop(), pkg.ext, socket);
}

async function handle_pkg(pkg: to_server.pkg, socket: WebSocket) {
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
		case to_server.pkg_ids.tmp_file_request:
			await handle_tmp_file_request(pkg.data as to_server.tmp_file_request_pkg, socket);
			break;
		default:
			throw new Error(`Unknown package id: ${pkg.id}`);
	}
}

const { reqHandler: api_handler, router } = create(ErrorMode.ERROR_JSON);

function reqHandler(req: Request) {
	if (req.headers.get("upgrade") != "websocket") {
		return api_handler(req);
	}

	const { socket: ws, response } = Deno.upgradeWebSocket(req);
	log("server", "New client connected");

	let client_authenticated = false;

	if (config.get("log_packets", "websocket")) {
		const old_send = ws.send;
		ws.send = async (data: string | Blob | ArrayBufferView | ArrayBufferLike) => {
			log("pkg", "s -> c " + data);
			await old_send.call(ws, data);
		};
	}

	ws.onmessage = async (e) => {
		if (config.get("log_packets", "websocket")) {
			log("pkg", "s <- c " + e.data);
		}

		if (!client_authenticated) {
			if (String(e.data).startsWith("auth:")) {
				const auth_data = String(e.data).substring(5);
				log("server", `Authenticating client using key ${auth_data}`);
				if (auth_data == config.get("key", "websocket")) {
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
			const pkg = JSON.parse(e.data) as to_server.pkg;
			try {
				await handle_pkg(pkg, ws);
			} catch (e) {
				log("error", "Oepsi woepsie: " + e);
				from_server.send_internal_error(String("Error"), pkg, ws);
			}
		}
	};
	ws.onclose = (_e) => {
		log("server", "Client disconnected");
	};

	return response;
}

function main() {
	let config_file = "config.cfg";
	if (Deno.args.length > 0) {
		config_file = Deno.args[0];
	}
	init_config(config_file);
	init_tmp_files();
	init_command_manager(String(config.get("command_prefix")));
	keystore_load();

	set_logger({
		logger: (msg) => log("router", msg),
	});

	v1.get_handlers().forEach((h) => router.add(h.path, h.handler, h.method));

	serve(reqHandler, {
		port: Number(config.get("port", "websocket")),
		onListen: (params) => {
			log("server", "Listening on " + params.hostname + ":" + params.port);
		},
	});

	load_all_loadables();

	setInterval(backup, 1000 * 60 * 60 * 12);
	backup();

	const handler: EventHandler<to_server.on_message_pkg> = {
		name: "on_message",
		// deno-lint-ignore require-await
		async executor(pkg: to_server.on_message_pkg) {
			log("message", `${pkg.user_id}: ${pkg.message}`);
		},
	};
	event.add(handler);
}

main();
