import { loadable } from "../../loadable.ts";
import { command_manager, CommandEvent, CommandResponse, Command, CommandExecutor, fail, empty } from "../command.ts";

import { download } from "https://deno.land/x/download/mod.ts";

import { get_file_extension, get_temp_file } from "../../utils.ts";

export default class Animals implements loadable {
	load(): void {
		command_manager.add_command(new Command("fox", "Cuteness awaits!", "Use '#fox' to see a cute fox!", {
			execute: async (event: CommandEvent): Promise<CommandResponse> => {
				if (event.interface.args.length != 0) {
					return fail;
				}

				var fox = await (await fetch("https://randomfox.ca/floof/?ref=apilist.fun")).json() as {
					image: string;
					link: string;
				};
				
				var file = get_temp_file(get_file_extension(fox.image));
				await download(fox.image, {
					dir: file.split("/").slice(0, -1).join("/"),
					file: file.split("/").pop() as string
				});

				await event.interface.send_picture_message(file);

				return empty;
			}
		} as CommandExecutor, undefined));
	}
}