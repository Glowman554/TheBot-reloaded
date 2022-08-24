import { Route } from "https://deno.land/x/simple_router@0.2/mod.ts";
import { Command, command_manager } from "../../command/command.ts";
import { config } from "../../config/config.ts";

export namespace v1 {
	export interface V1Auth {
		token: string;
	};

	export interface V1CommandsResponse {
		commands: Command[];
	};


	export interface V1ConfigGetRequest extends V1Auth {
		key: string;
		section: string;
	};

	export interface V1ConfigGetResponse {
		config: any;
	};

	async function v1_token_check(req: Request) {
		var json = await req.json() as V1Auth;
		if (json.token != config.get("key", "websocket")) {
			throw new Error("Invalid token!");
		}

		return json;
	}

	async function v1_commands_handler(req: Request): Promise<Response> {
		await v1_token_check(req);
		return new Response(JSON.stringify({
			commands: command_manager.commands
		} as V1CommandsResponse, null, "\t"));
	}

	async function v1_config_get(req: Request): Promise<Response> {
		var json = await v1_token_check(req) as V1ConfigGetRequest;
		return new Response(JSON.stringify({
			config: config.get(json.key, json.section)
		} as V1ConfigGetResponse, null, "\t"));
	}

	export function get_handlers() {
		var handlers: Route[] = [];

		handlers.push({
			handler: v1_commands_handler,
			method: "POST",
			path: "/v1/commands"
		});

		handlers.push({
			handler: v1_config_get,
			method: "POST",
			path: "/v1/config/get"
		});

		return handlers;
	}

}