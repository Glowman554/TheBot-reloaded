import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { response } from "../../utils/response.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";
import { check_permission } from "../permission.ts";

export default class Repeat implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("repeat", "Repeat a command!", help_text("Use '<prefix>repeat [command]' repeat a command!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length < 2) {
						return fail;
					}

					let count = parseInt(event.interface.args[0]);

					if (!event.interface.args[1].startsWith(command_manager.prefix)) {
						event.interface.args[1] = command_manager.prefix + event.interface.args[1];
					}

					if (event.interface.args[1] == command_manager.prefix + "repeat") {
						return {
							is_response: true,
							response: "no",
						};
					}

					if (count < 11 || check_permission(event.interface.user, "no_limit")) {
						if (count < 0) {
							return response("Count must be greater than 0");
						} else {
							event.interface.args.shift();
							event.interface.message = event.interface.args.join(" ");
							event.interface.command = event.interface.args[0];
							var command_event = new CommandEvent(event.interface);

							for (let i = 0; i < count; i++) {
								await command_manager.on_command(command_event);
							}
						}
					} else {
						return response("Count must be less then 10!");
					}

					return empty;
				},
			} as CommandExecutor, undefined),
		);
	}
}
