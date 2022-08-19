import { serve } from "https://deno.land/std/http/mod.ts";

import { to_server, from_server } from "./protocol.ts";
import { log } from "./logger.ts";

import { CommandEventImpl } from "./command/command_event_interface.ts";
import { command_manager, CommandEvent, Command, CommandExecutor, CommandResponse } from "./command/command.ts";

async function handle_on_message_pkg(pkg: to_server.on_message_pkg, socket: WebSocket) {
	await from_server.send_message_ack(pkg.id, socket);

	var command_event = new CommandEventImpl(socket, pkg);
	await command_manager.on_command(new CommandEvent(command_event));
}

async function handle_log_pkg(pkg: to_server.log_pkg, socket: WebSocket) {
	log(pkg.client_name, pkg.message);
}

async function handle_pkg(pkg:to_server.pkg, socket: WebSocket) {
	switch (pkg.id) {
		case to_server.pkg_ids.on_message:
			await handle_on_message_pkg(pkg.data as to_server.on_message_pkg, socket);
			break;
		case to_server.pkg_ids.log:
			await handle_log_pkg(pkg.data as to_server.log_pkg, socket);
			break;
		default:
			console.log(`Unknown package id: ${pkg.id}`);
			break;
	}
}

async function reqHandler(req: Request) {
	if (req.headers.get("upgrade") != "websocket") {
		log("server", "Invalid upgrade header");
		return new Response(null, { status: 501 });
	}

	const { socket: ws, response } = Deno.upgradeWebSocket(req);
	log("server", "New client connected");

	ws.onmessage = async (e) => {
		var pkg = JSON.parse(e.data) as to_server.pkg;
		try {
			await handle_pkg(pkg, ws);
		} catch (e) {
			log("error", "Oepsi woepsie: " + e);
			from_server.send_internal_error(String(e), pkg, ws);
		}
	}
	return response;
}

serve(reqHandler, { port: 8080 });

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