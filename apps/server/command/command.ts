import { log } from "../logger.ts";
import { help_text } from "../utils/help.ts";
import { check_permission } from "./permission.ts";

export const fail = {
	is_response: true,
	response: "Something is wrong!",
} as CommandResponse;

export const empty = {
	is_response: false,
	response: undefined,
} as CommandResponse;

export interface CommandResponse {
	is_response: boolean;
	response: string | undefined;
}

export interface CommandExecutor {
	execute(event: CommandEvent): Promise<CommandResponse>;
}

export class Command {
	name: string;
	help: string;
	help_long: string | undefined;
	executor: CommandExecutor;
	perm: string | undefined;

	constructor(name: string, help: string, help_long: string | undefined, executor: CommandExecutor, perm: string | undefined) {
		this.name = name;
		this.help = help;
		this.help_long = help_long;
		this.executor = executor;
		this.perm = perm;
	}
}

export interface CommandEventInterface {
	message: string;
	command: string;

	user: string;
	chat_id: string;

	send_message(message: string): Promise<void>;

	send_picture_message(file: string): Promise<void>;
	send_video_message(file: string): Promise<void>;
	send_sticker_message(file: string): Promise<void>;
	send_audio_message(file: string): Promise<void>;

	set_bot_status(status: string): Promise<void>;

	files: string[] | undefined;
	mentions: string[] | undefined;

	quote_text: string | undefined;

	args: string[];
}

export class CommandEvent {
	interface: CommandEventInterface;

	get_arguments(array: string[]): string[] {
		// just remove the first element of the array
		// yes i know it could be done more easily but it works im not going to touch it

		if (array.length < 2) {
			return [];
		}

		const new_array: string[] = [];

		for (let i = 1; i < array.length; i++) {
			new_array.push(array[i]);
		}

		return new_array;
	}

	get_args_or_quote(): string[] {
		if (this.interface.quote_text) {
			return this.interface.quote_text.split(" ");
		} else {
			return this.interface.args;
		}
	}

	_1_arg_or_quote_text(): boolean {
		return (!(this.interface.args.length < 1) || Boolean(this.interface.quote_text));
	}

	constructor(event_interface: CommandEventInterface) {
		this.interface = event_interface;

		this.interface.args = this.get_arguments(this.interface.args);
	}
}

export class CommandManager {
	commands: Command[];
	prefix: string;

	constructor(prefix: string) {
		this.prefix = prefix;
		this.commands = [];
	}

	add_command(command: Command): void {
		command.name = this.prefix + command.name;

		for (const i in this.commands) {
			if (this.commands[i].name === command.name) {
				this.commands[i] = command;
				log("command", "Updating command " + command.name);
				return;
			}
		}

		this.commands.push(command);
		log("command", "Adding command " + command.name);
	}

	async on_command(command_event: CommandEvent): Promise<void> {
		if (command_event.interface.command === this.prefix + "help") {
			switch (command_event.interface.args.length) {
				case 0: {
					let help_message = help_text("<bot_name> Help!\n");

					let longest_name = 0;
					for (const i in this.commands) {
						if (check_permission(command_event.interface.user, this.commands[i].perm)) {
							if (this.commands[i].name.length > longest_name) {
								longest_name = this.commands[i].name.length;
							}
						}
					}

					for (const i in this.commands) {
						if (check_permission(command_event.interface.user, this.commands[i].perm)) {
							let name = this.commands[i].name;
							const missing_spaces = longest_name - name.length;
							for (let i = 0; i < missing_spaces; i++) name += " ";

							help_message += `${name} -> ${this.commands[i].help}\n`;
						}
					}

					return command_event.interface.send_message("<bg_code>" + help_message + "<bg_code>");
				}

				case 1: {
					let help_message = `${this.prefix + command_event.interface.args[0]} Help!\n\n`;
					const command = this.commands.find((x) => x.name === this.prefix + command_event.interface.args[0]);

					if (command !== undefined) {
						if (command.help_long !== undefined) {
							help_message += `${command.help_long}`;
						} else {
							return command_event.interface.send_message("No help available for this command");
						}

						return command_event.interface.send_message("<bg_code>" + help_message + "<bg_code>");
					} else {
						return command_event.interface.send_message("Command not found!");
					}
				}

				default:
					return command_event.interface.send_message("Do you relay need help with help!");
			}
		} else {
			const command = this.commands.find((x) => x.name === command_event.interface.command);

			if (command === undefined) {
				return;
			}

			if (!check_permission(command_event.interface.user, "blacklist")) {
				if (check_permission(command_event.interface.user, command.perm)) {
					const result = await command.executor.execute(command_event);

					if (result.is_response) {
						if (result.response !== undefined) {
							return command_event.interface.send_message(result.response);
						}
					}
				} else {
					return command_event.interface.send_message("You don't have permission to do that!");
				}
			}
		}
	}
}

export let command_manager: CommandManager;
export function init_command_manager(prefix: string): void {
	log("command", "Initializing command manager with prefix " + prefix);

	command_manager = new CommandManager(prefix);
}
