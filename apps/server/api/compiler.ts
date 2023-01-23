import { log } from "../logger.ts";

export interface CompilerResult {
	stderr: string;
	stdout: string;
	status: Deno.ProcessStatus;
}

export interface CompilerFile {
	file: string;
	prog: string;
}

export class CompilerApi {
	url: string;

	constructor(url: string) {
		if (url.endsWith("/")) {
			url = url.substring(0, url.length - 1);
		}
		log("compiler", "url: " + url);
		this.url = url;
	}

	async run(command: string): Promise<CompilerResult> {
		log("compiler", "running: '" + command + "'...");
		const json = await (await fetch(this.url + "/run", {
			method: "POST",
			body: command,
		})).json();
		if (json.error) throw new Error(json.error);

		return json;
	}

	async run_nojail(command: string): Promise<CompilerResult> {
		log("compiler", "running: '" + command + "'...");
		const json = await (await fetch(this.url + "/run-nojail", {
			method: "POST",
			body: command,
		})).json();
		if (json.error) throw new Error(json.error);

		return json;
	}

	async compile_and_run(file: string): Promise<CompilerResult> {
		log("compiler", "compiling and running: '" + file + "'...");
		const json = await (await fetch(this.url + "/compile", {
			method: "POST",
			body: JSON.stringify({
				file: file.split("/").pop(),
				prog: Deno.readTextFileSync(file),
			} as CompilerFile),
		})).json();
		if (json.error) throw new Error(json.error);

		return json;
	}
}

export let compiler: CompilerApi;

export function init_compiler_api(url: string) {
	log("compiler", "Initializing compiler api...");
	compiler = new CompilerApi(url);
}
