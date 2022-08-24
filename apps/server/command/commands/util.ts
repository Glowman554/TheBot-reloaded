import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Utils implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("crash", "Crash the bot!", help_text("Use '<prefix>crash' to crash the bot! (Admin only)"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					throw new Error("Crash!");
				},
			} as CommandExecutor, "crash"),
		);

		command_manager.add_command(
			new Command("ping", "Ping the bot!", help_text("Use '<prefix>ping' to ping the bot!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					return {
						is_response: true,
						response: "Pong!",
					};
				},
			} as CommandExecutor, undefined),
		);

		command_manager.add_command(
			new Command("say", "Say something to the chat!", help_text("Use '<prefix>say <message>' to say something to the chat!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length == 0) {
						return fail;
					}

					return {
						is_response: true,
						response: event.interface.args.join(" "),
					};
				},
			} as CommandExecutor, undefined),
		);

		command_manager.add_command(
			new Command("eval", "Run javascript!", help_text("Use '<prefix>eval [what]' to execute javascript!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length == 0) {
						return fail;
					}
					var result = eval(event.interface.args.join(" "));
					var response = String(result);
					try {
						response = JSON.stringify(result, null, "\t");
					} catch (e) {}

					return {
						is_response: true,
						response: response,
					};
				},
			} as CommandExecutor, "eval"),
		);
	}
}
