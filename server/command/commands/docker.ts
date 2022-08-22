import { docker, init_docker_api } from "../../api/docker.ts";
import { config } from "../../config.ts";
import { loadable } from "../../loadable.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Docker implements loadable {
	load(): void {
		init_docker_api(config.get("proxy", "docker") as string);

		command_manager.add_command(
			new Command("docker", "Manage Docker", "Use '#docker [list/start/stop/restart/remove] [container?]' to manage Docker containers.", {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 1 && event.interface.args.length != 2) {
						return fail;
					}

					switch (event.interface.args[0]) {
						case "list":
							if (event.interface.args.length != 1) {
								return fail;
							}
							
							var containers = await docker.list();
							var message = "";
							for (var container of containers) {
								message += container.name + ": " + container.state + "\n";
							}

							return {
								is_response: true,
								response: message,
							};
							break;

						
						case "start":
							if (event.interface.args.length != 2) {
								return fail;
							}
							break;
						
						case "stop":
							if (event.interface.args.length != 2) {
								return fail;
							}
							break;
						
						case "restart":
							if (event.interface.args.length != 2) {
								return fail;
							}
							break;
						
						case "remove":
							if (event.interface.args.length != 2) {
								return fail;
							}
							break;
						
						default:
							return fail;
					}
					
					return empty;
				},
			} as CommandExecutor, "docker"),
		);
	}
}
