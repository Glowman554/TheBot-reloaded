import { loadable } from "../../loadable.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

import { get_cat, get_dog, get_fox } from "../../api/animals.ts";
import { download_to_tmp_file } from "../../api/download.ts";
import { help_text } from "../../utils/help.ts";
import { FurryApi } from "../../api/furry.ts";

export default class Animals implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("fox", "See a cute fox!", help_text("Use '<prefix>fox' to see a cute fox!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					var file = await download_to_tmp_file(await get_fox());

					await event.interface.send_picture_message(file);

					return empty;
				},
			} as CommandExecutor, undefined),
		);

		command_manager.add_command(
			new Command("dog", "See a cute dog!", help_text("Use '<prefix>dog' to see a cute dog!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					var file = await download_to_tmp_file(await get_dog());

					await event.interface.send_picture_message(file);

					return empty;
				},
			} as CommandExecutor, undefined),
		);

		command_manager.add_command(
			new Command("cat", "See a cute cat!", help_text("Use '<prefix>cat' to see a cute cat!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

					var file = await download_to_tmp_file(await get_cat());

					await event.interface.send_picture_message(file);

					return empty;
				},
			} as CommandExecutor, undefined),
		);

		command_manager.add_command(
			new Command("furry", "See a cute furry image!", help_text("Use '<prefix>furry [method?/list?]' to see a cute furry image!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 1 && event.interface.args.length != 0) {
						return fail;
					}

					var method = "furry/fursuit";
					if (event.interface.args.length == 1) {
						var method = event.interface.args[0];
						if (method == "list") {
							return {
								is_response: true,
								response: "I know: " + new FurryApi()._methods.join(", "),
							};
						}
					}

					var file = await download_to_tmp_file(await new FurryApi().methods[method]());

					await event.interface.send_picture_message(file);

					return empty;
				},
			} as CommandExecutor, undefined),
		);
	}
}
