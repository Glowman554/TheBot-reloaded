import { MikkiAccount } from "https://deno.land/x/mikki@0.12/client.ts";
import { init_mikki_api, mikki } from "../../api/mikki.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { Csv } from "../../utils/csv.ts";
import { help_text } from "../../utils/help.ts";
import { dateToString } from "../../utils/time.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";

export default class Mikki implements loadable {
	load(): void {
		init_mikki_api(config.get("url", "mikki") as string, config.get("token", "mikki") as string);

		command_manager.add_command(
			new Command("mikki", "Manage Mikki accounts", help_text("Use '<prefix>mikki [page/changelog] [list<page or changelog>/get<page>] [page_id<page>?]' to access the Mikki."), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 2 && event.interface.args.length != 3) {
						return fail;
					}

					switch (event.interface.args[0]) {
						case "page":
							switch (event.interface.args[1]) {
								case "list": {
									if (event.interface.args.length != 2) return fail;

									const pages = await mikki.pages();
									let text = "";
									pages.forEach((p) => text += `${p.meta.page_title} (id: ${p.id})\n`);

									return {
										is_response: true,
										response: text,
									};
								}

								case "get": {
									if (event.interface.args.length != 3) return fail;

									const page = await mikki.page(event.interface.args[2]);
									if (page == undefined) {
										throw new Error("Page not found!");
									}

									return {
										is_response: true,
										response: "<bg_code>" + page.text + "<bg_code>",
									};
								}
								default:
									return fail;
							}

						case "changelog": {
							if (event.interface.args[1] != "list") {
								return fail;
							}

							if (event.interface.args.length != 2) return fail;

							const changes = await mikki.changes();
							let text = "";
							changes.forEach((c) => text += `${dateToString(c.when)}: ${c.what}\n`);

							return {
								is_response: true,
								response: text,
							};
						}
						default:
							return fail;
					}
				},
			} as CommandExecutor, undefined),
		);

		command_manager.add_command(
			new Command("mikki-acc", "Manage Mikki accounts", help_text("Use '<prefix>mikki-acc [editor/delete/list] [account?] [editor?]' to manage Mikki accounts."), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 1 && event.interface.args.length != 2 && event.interface.args.length != 3) {
						return fail;
					}

					switch (event.interface.args[0]) {
						case "list": {
							if (event.interface.args.length != 1) return fail;
							const csv = new Csv();

							csv.push_row(["username", "editor"]);
							csv.push_row(["", ""]);

							(await mikki.accounts()).forEach((a) => csv.push_row([a.username, String(a.editor)]));

							return {
								is_response: true,
								response: "<bg_code>" + csv.str() + "<bg_code>",
							};
						}

						case "delete": {
							if (event.interface.args.length != 2) return fail;
							const user = event.interface.args[1];

							await mikki.account_delete(user);

							return {
								is_response: true,
								response: "Successfully deleted " + user,
							};
						}

						case "editor": {
							if (event.interface.args.length != 3) return fail;
							const user = event.interface.args[1];
							const editor = event.interface.args[2] == "true";

							const account = await mikki.account(user);
							if (!account) {
								return fail;
							}

							account.editor = editor;
							await mikki.account_update(account as MikkiAccount);

							return {
								is_response: true,
								response: "Successfully updated " + user,
							};
						}

						default:
							return fail;
					}
				},
			} as CommandExecutor, "mikki_account"),
		);
	}
}
