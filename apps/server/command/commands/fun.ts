import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";
import { get_meme } from "../../api/meme.ts";
import { download_to_tmp_file } from "../../api/download.ts";

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

        command_manager.add_command(
			new Command("meme", "See a meme!", help_text("Use '<prefix>meme' to see a meme!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					var file = await download_to_tmp_file(await get_meme());

					await event.interface.send_picture_message(file);

					return empty;
				},
			} as CommandExecutor, undefined),
		);
	}
}
