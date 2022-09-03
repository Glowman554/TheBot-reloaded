import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";
import { get_roles, push_role, remove_role } from "../permission.ts";

export default class Utils implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("crash", "Crash the bot!", help_text("Use '<prefix>crash' to crash the bot! (Admin only)"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					throw new Error("Crash!");
				},
			} as CommandExecutor, "crash"),
		);

		command_manager.add_command(
			new Command("ping", "Ping the bot!", help_text("Use '<prefix>ping' to ping the bot!"), {
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
			new Command("say", "Say something to the chat!", help_text("Use '<prefix>say <message>' to say something to the chat!"), {
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
			new Command("eval", "Run javascript!", help_text("Use '<prefix>eval [what]' to execute javascript!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length == 0) {
						return fail;
					}
					var result = eval(event.interface.args.join(" "));
					var response = String(result);
					try {
						response = JSON.stringify(result, null, "\t");
					} catch (e) {}

					return {
						is_response: true,
						response: `<bg_code>${response}<bg_code>`,
					};
				},
			} as CommandExecutor, "eval"),
		);

		command_manager.add_command(
			new Command("role", "Manage roles!", help_text("Use '<prefix>role [list, add, remove]' to manage roles!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length < 2) {
						return fail;
					}

					switch (event.interface.args[0]) {
						case "add": {
							if (event.interface.args.length != 3) {
								return fail;
							}

							let user = event.interface.mentions;
							let role = event.interface.args[2];

							if (user == undefined) {
								return fail;
							}

							push_role(user.length != 0 ? user[0] : event.interface.args[1], role);

							return {
								is_response: true,
								response: `Successfully added role ${role} to ${event.interface.args[1]}!`,
							};
						}

						case "list": {
							if (event.interface.args.length != 2) {
								return fail;
							}

							let user = event.interface.mentions;

							if (user == undefined) {
								return fail;
							}

							let roles = get_roles(user.length != 0 ? user[0] : event.interface.args[1]);

							return {
								is_response: true,
								response: `${event.interface.args[1]} has the following roles: ${roles.join(", ")}`,
							};
						}

						case "remove": {
							if (event.interface.args.length != 3) {
								return fail;
							}

							let user = event.interface.mentions;
							let role = event.interface.args[2];

							if (user == undefined) {
								return fail;
							}

							remove_role(user.length != 0 ? user[0] : event.interface.args[1], role);

							return {
								is_response: true,
								response: `Successfully removed role ${role} from ${event.interface.args[1]}!`,
							};
						}

						default:
							return fail;
					}
				},
			} as CommandExecutor, "role"),
		);
	}
}
