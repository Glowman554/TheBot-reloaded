import { docker, init_docker_api } from "../../api/docker.ts";
import { config } from "../../config.ts";
import { loadable } from "../../loadable.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Docker implements loadable {
	load(): void {
		init_docker_api(config.get("proxy", "docker") as string);
		docker.list().then(console.log);
	}
}
