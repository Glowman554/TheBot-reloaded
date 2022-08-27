import { init_mikki_api, mikki } from "../../api/mikki.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { log } from "../../logger.ts";
import { Csv } from "../../utils/csv.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";

export default class Mikki implements loadable {
	load(): void {
		init_mikki_api(config.get("url", "mikki") as string, config.get("token", "mikki") as string);

		log("TODO", "implement other parts of the command");

		command_manager.add_command(
			new Command("mikki-acc", "Manage Mikki accounts", help_text("Use '<prefix>mikki [editor/delete/list] [account?] [editor?]' to manage Mikki accounts."), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 1 && event.interface.args.length != 2 && event.interface.args.length != 3) {
						return fail;
					}

					switch (event.interface.args[0]) {
						case "list":
							if (event.interface.args.length != 1) return fail;
							var csv = new Csv();

							csv.push_row(["username", "editor"]);
							csv.push_row(["", ""]);

							(await mikki.accounts()).forEach((a) => csv.push_row([a.username, String(a.editor)]));

							return {
								is_response: true,
								response: "<bg_code>" + csv.str() + "<bg_code>",
							};

						case "delete":
							if (event.interface.args.length != 2) return fail;
							var user = event.interface.args[1];

							await mikki.account_delete(user);

							return {
								is_response: true,
								response: "Successfully deleted " + user,
							};

						default:
							return fail;
					}
				},
			} as CommandExecutor, "mikki_account"),
		);
	}
}
