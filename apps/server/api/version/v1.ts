// deno-lint-ignore-file no-explicit-any
import { Route } from "https://deno.land/x/simple_router@0.7/mod.ts";
import { Command, command_manager } from "../../command/command.ts";
import { config } from "../../config/config.ts";
import { log } from "../../logger.ts";
import getFiles from "https://deno.land/x/getfiles@v1.0.0/mod.ts";

// deno-lint-ignore no-namespace
export namespace v1 {
	export interface V1Auth {
		token: string;
	}

	export interface V1CommandsResponse {
		commands: Command[];
	}

	export interface V1ConfigGetRequest extends V1Auth {
		key: string;
		section: string;
	}

	export interface V1ConfigGetResponse {
		config: any;
	}

	export interface V1ConfigGenResponse {
		config: string;
	}

	export interface V1LogGetRequest extends V1Auth {
		file: string;
	}

	export interface V1LogGetResponse {
		log: string;
	}

	export interface V1LogListResponse {
		logs: string[];
	}

	async function v1_token_check(req: Request) {
		const json = await req.json() as V1Auth;
		if (json.token != config.get("key", "websocket")) {
			throw new Error("Invalid token!");
		}

		return json;
	}

	async function v1_commands_handler(req: Request): Promise<Response> {
		await v1_token_check(req);
		return new Response(JSON.stringify(
			{
				commands: command_manager.commands,
			} as V1CommandsResponse,
			null,
			"\t",
		));
	}

	async function v1_config_get(req: Request): Promise<Response> {
		const json = await v1_token_check(req) as V1ConfigGetRequest;
		return new Response(JSON.stringify(
			{
				config: config.get(json.key, json.section),
			} as V1ConfigGetResponse,
			null,
			"\t",
		));
	}

	async function v1_config_gen(req: Request): Promise<Response> {
		await v1_token_check(req);
		return new Response(JSON.stringify(
			{
				config: config.gen(),
			} as V1ConfigGetResponse,
			null,
			"\t",
		));
	}

	async function v1_log_get(req: Request): Promise<Response> {
		const json = await v1_token_check(req) as V1LogGetRequest;
		return new Response(JSON.stringify(
			{
				log: Deno.readTextFileSync(String(config.get("log_folder")) + "/" + json.file + ".txt"),
			} as V1LogGetResponse,
			null,
			"\t",
		));
	}

	async function v1_log_list(req: Request): Promise<Response> {
		await v1_token_check(req);
		return new Response(JSON.stringify(
			{
				logs: getFiles(String(config.get("log_folder"))).map((f) => f.name).map((f) => f.replace(".txt", "")),
			} as V1LogListResponse,
			null,
			"\t",
		));
	}

	export function get_handlers() {
		const handlers: Route[] = [];

		handlers.push({
			handler: v1_commands_handler,
			method: "POST",
			path: "/v1/commands",
		});

		handlers.push({
			handler: v1_config_get,
			method: "POST",
			path: "/v1/config/get",
		});

		handlers.push({
			handler: v1_config_gen,
			method: "POST",
			path: "/v1/config/gen",
		});

		handlers.push({
			handler: v1_log_get,
			method: "POST",
			path: "/v1/log/get",
		});

		handlers.push({
			handler: v1_log_list,
			method: "POST",
			path: "/v1/log/list",
		});

		log("TODO", "add /v1/tmp/list");
		log("TODO", "add /v1/roles/get");
		log("TODO", "add /v1/roles/add");
		log("TODO", "add /v1/roles/remove");

		return handlers;
	}
}
