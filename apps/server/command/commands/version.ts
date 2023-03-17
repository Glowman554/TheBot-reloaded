// deno-lint-ignore-file require-await no-empty
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";
import { version } from "../../version.ts";

export default class Version implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("version", "", help_text("'<prefix>version'"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

                    return {
						is_response: true,
						response: version
					};
				},
			} as CommandExecutor, undefined),
		);
	}
}
