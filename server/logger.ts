import { config } from "./config.ts";

export function log(module: string, message: string): void {
	console.log(message.split("\n").map((line) => `[${module}] ${line}`).join("\n"));

	var log_folder = null;
	if (config) {
		try {
			log_folder = String(config.get("log_folder"));
		} catch (e) {}
	}

	if (log_folder) {
		Deno.writeTextFileSync(`${log_folder}/${module}.txt`, message.split("\n").map((line) => `[${new Date().toLocaleString()}] ${line}`).join("\n") + "\n", { append: true });
	}
}
