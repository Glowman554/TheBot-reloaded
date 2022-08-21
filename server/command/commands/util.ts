import { loadable } from "../../loadable.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Utils implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("crash", "Crash the bot!", "Use '#crash' to crash the bot! (Admin only)", {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					throw new Error("Crash!");
				},
			} as CommandExecutor, "crash"),
		);

		command_manager.add_command(
			new Command("ping", "Ping the bot!", "Use '#ping' to ping the bot!", {
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
			new Command("say", "Say something to the chat!", "Use '#say <message>' to say something to the chat!", {
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
			new Command("test", "", "", {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					event.interface.send_sticker_message("/home/janick/Pictures/Screenshot_20220814_010201.png");
					event.interface.send_picture_message("/home/janick/Pictures/Screenshot_20220814_010201.png");
					event.interface.set_bot_status("#test");

					return empty;
				},
			} as CommandExecutor, undefined),
		);
	}
}
