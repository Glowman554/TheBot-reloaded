// deno-lint-ignore-file require-await no-empty
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";
import { version } from "../../version.ts";
import { keystore_get, keystore_set } from "../../config/keystore.ts";

export default class Todo implements loadable {
	load(): void {
		var todo_list = JSON.parse(keystore_get("todo") || "{}") as { [key: string]: string[] };

		function save() {
			keystore_set("todo", JSON.stringify(todo_list));
		}

		command_manager.add_command(
			new Command("todo", "Manage your todo list!", help_text("Use '<prefix>todo [add, remove, clear, list]' to manage your todo list!\n\nExample: \n<prefix>todo add something\n<prefix>todo remove 0\n<prefix>todo clear\n<prefix>todo list"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length == 0) {
						return fail;
					}

					var user = event.interface.user;

					// check if user has todo list if not create empty one
					if (!todo_list[user]) {
						todo_list[user] = [];
					}

					switch (event.interface.args.shift()) {
						case "add":
							if (event.interface.args.length < 1) {
								return fail;
							}

							todo_list[user].push(event.interface.args.join(" "));
							save();

							return {
								is_response: true,
								response: "Your todo list is now " + todo_list[user].length + " entry's long!",
							};

						case "remove":
							if (event.interface.args.length != 1) {
								return fail;
							}

							todo_list[user].splice(parseInt(event.interface.args[0]), 1);
							save();

							return {
								is_response: true,
								response: "Your todo list is now " + todo_list[user].length + " entry's long!",
							};

						case "clear":
							if (event.interface.args.length != 0) {
								return fail;
							}

							todo_list[user] = [];
							save();

							return {
								is_response: true,
								response: "Your todo list is now " + todo_list[user].length + " entry's long!",
							};

						case "list":
							if (event.interface.args.length != 0) {
								return fail;
							}

							var text = "Your todo list: \n";
							for (let i in todo_list[user]) {
								text += i + ": " + todo_list[user][i] + "\n";
							}

							return {
								is_response: true,
								response: text,
							};
						default:
							return fail;
					}
				},
			} as CommandExecutor, undefined),
		);
	}
}
