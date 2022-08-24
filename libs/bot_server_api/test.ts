import { v1, v1_types } from "./mod.ts";

async function main() {
	var options: v1_types.V1Options = {
		url: "http://localhost:8080/v1",
		token: "thebestbot",
	};

	console.log(await v1.v1_commands(options));
	console.log(await v1.v1_config_get(options, "port", "websocket"));
	console.log(await v1.v1_config_gen(options));
	console.log(await v1.v1_log_get(options, "server"));
	console.log(await v1.v1_log_list(options));
}

main();
