import { loadable } from "../../loadable.ts";
import { command_manager, CommandEvent, CommandResponse, Command, CommandExecutor, fail, empty } from "../command.ts";


import { get_fox } from "../../api/animals.ts";
import { download_to_tmp_file } from "../../api/download.ts";

export default class Animals implements loadable {
	load(): void {
		command_manager.add_command(new Command("fox", "Cuteness awaits!", "Use '#fox' to see a cute fox!", {
			execute: async (event: CommandEvent): Promise<CommandResponse> => {
				if (event.interface.args.length != 0) {
					return fail;
				}

				var file = await download_to_tmp_file(await get_fox());

				await event.interface.send_picture_message(file);

				return empty;
			}
		} as CommandExecutor, undefined));
	}
}