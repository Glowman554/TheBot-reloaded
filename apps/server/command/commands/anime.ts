import { query_by_name } from "../../api/anime/anime.ts";
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";

export default class Anime implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("anime", "Search anime's!", help_text("Use '<prefix>anime [anime]' to search anime's!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (!event._1_arg_or_quote_text()) {
						return fail;
					}

					var result = await query_by_name("gogoanime", event.get_args_or_quote().join(" "));

					var text = "";
					result.forEach((r) => text += `${r.name}:\n-> ${r.episodes} episodes. (${r.url})\n\n`);

					return {
						is_response: true,
						response: text,
					};
				},
			} as CommandExecutor, undefined),
		);
	}
}
