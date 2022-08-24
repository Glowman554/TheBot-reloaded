import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Fun implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("coinflip", "Flip a coin!", help_text("Use '<prefix>coinflip' to flip a coin!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					return {
						is_response: true,
						response: Math.random() >= 0.5 ? "You've landed on heads!" : "You've landed on tails!",
					};
				},
			} as CommandExecutor, undefined),
		);
	}
}
