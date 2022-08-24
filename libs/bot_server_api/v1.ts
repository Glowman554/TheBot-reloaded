export namespace v1_types {
	export interface Command {
		name: string;
		help: string;
		help_long: string | undefined;
		perm: string | undefined;
	}

	export interface V1Auth {
		token: string;
	}

	export interface V1Response {
		error?: string;
	}

	export interface V1CommandsResponse extends V1Response {
		commands: Command[];
	}

	export interface V1ConfigGetRequest extends V1Auth {
		key: string;
		section: string;
	}

	export interface V1ConfigGetResponse extends V1Response {
		config: any;
	}

	export interface V1ConfigGenResponse extends V1Response {
		config: string;
	}

	export interface V1LogGetRequest extends V1Auth {
		file: string;
	}

	export interface V1LogGetResponse extends V1Response {
		log: string;
	}

	export interface V1LogListResponse extends V1Response {
		logs: string[];
	}

	export interface V1Options {
		url: string;
		token: string;
	}
}
export namespace v1 {
	export async function v1_commands(options: v1_types.V1Options) {
		var req: v1_types.V1Auth = {
			token: options.token,
		};

		return await (await fetch(options.url + "/commands", {
			method: "POST",
			body: JSON.stringify(req),
		})).json() as v1_types.V1CommandsResponse;
	}

	export async function v1_config_get(options: v1_types.V1Options, key: string, section: string) {
		var req: v1_types.V1ConfigGetRequest = {
			token: options.token,
			key: key,
			section: section,
		};

		return await (await fetch(options.url + "/config/get", {
			method: "POST",
			body: JSON.stringify(req),
		})).json() as v1_types.V1ConfigGetResponse;
	}

	export async function v1_config_gen(options: v1_types.V1Options) {
		var req: v1_types.V1Auth = {
			token: options.token,
		};

		return await (await fetch(options.url + "/config/gen", {
			method: "POST",
			body: JSON.stringify(req),
		})).json() as v1_types.V1ConfigGenResponse;
	}

	export async function v1_log_get(options: v1_types.V1Options, file: string) {
		var req: v1_types.V1LogGetRequest = {
			token: options.token,
			file: file,
		};

		return await (await fetch(options.url + "/log/get", {
			method: "POST",
			body: JSON.stringify(req),
		})).json() as v1_types.V1LogGetResponse;
	}

	export async function v1_log_list(options: v1_types.V1Options) {
		var req: v1_types.V1Auth = {
			token: options.token,
		};

		return await (await fetch(options.url + "/log/list", {
			method: "POST",
			body: JSON.stringify(req),
		})).json() as v1_types.V1LogListResponse;
	}
}
