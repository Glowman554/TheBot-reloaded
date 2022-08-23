import { docker, init_docker_api } from "../../api/docker.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Docker implements loadable {
	load(): void {
		init_docker_api(config.get("proxy", "docker") as string);

		command_manager.add_command(
			new Command("docker", "Manage Docker", help_text("Use '<prefix>docker [list/start/stop/restart/remove] [container?]' to manage Docker containers."), {
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

						case "start":
							if (event.interface.args.length != 2) {
								return fail;
							}

							await docker.start(event.interface.args[1]);
							return {
								is_response: true,
								response: "Successfully started " + event.interface.args[1],
							};

						case "stop":
							if (event.interface.args.length != 2) {
								return fail;
							}

							await docker.stop(event.interface.args[1]);
							return {
								is_response: true,
								response: "Successfully stopped " + event.interface.args[1],
							};

						case "restart":
							if (event.interface.args.length != 2) {
								return fail;
							}

							await docker.restart(event.interface.args[1]);
							return {
								is_response: true,
								response: "Successfully restarted " + event.interface.args[1],
							};

						case "remove":
							if (event.interface.args.length != 2) {
								return fail;
							}

							await docker.remove(event.interface.args[1]);
							return {
								is_response: true,
								response: "Successfully removed  " + event.interface.args[1],
							};

						default:
							return fail;
					}
				},
			} as CommandExecutor, "docker"),
		);
	}
}
