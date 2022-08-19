import { log } from "../logger.ts";

export var fail = {
	is_response: true,
	response: "Something is wrong!"
} as CommandResponse;

export var empty = {
	is_response: false,
	response: undefined
} as CommandResponse;

export interface CommandResponse {
	is_response: boolean;
	response: string|undefined;
}

export interface CommandExecutor {
	execute(event: CommandEvent): Promise<CommandResponse>;
}

export class Command {
	name: string;
	help: string;
	help_long: string|undefined;
	executor: CommandExecutor;
	perm: string|undefined;

	constructor(name: string, help: string, help_long: string|undefined, executor: CommandExecutor, perm: string|undefined) {
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

	files: string[]|undefined;
	mentions: string[]|undefined;

	quote_text: string|undefined;

	args: string[];
}

export class CommandEvent {

	interface: CommandEventInterface;

	get_arguments(array: string[]): string[] {
		// just remove the first element of the array
		// yes i know it could be done more easily but it works im not going to touch it

		if(array.length < 2) {
			return [];
		}

		var new_array: string[] = [];

		for(var i = 1; i < array.length; i++) {
			new_array.push(array[i]);
		}

		return new_array;
	}

	constructor(event_interface: CommandEventInterface) {
		this.interface = event_interface;

		this.interface.args = this.get_arguments(this.interface.args);
	}
}

function check_permission(user: string, permission: string|undefined): boolean {
	// TODO: implement permissions
	return !(permission == "blacklist");
}

export class CommandManager {
	commands: Command[];
	prefix: string;

	constructor(prefix: string) {
		this.prefix = prefix;
		this.commands = [];
	}

	add_command(command: Command): void  {
		command.name = this.prefix + command.name;

		for (var i in this.commands) {
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
				case 0:
					var help_message = "TheBot Help!";

					for (var i in this.commands) {
						if (check_permission(command_event.interface.user, this.commands[i].perm)) {
							help_message += `\n\n${this.commands[i].name}\n${this.commands[i].help}`;
						}
					}

					return command_event.interface.send_message(help_message);
				
				case 1:
					var help_message = `${this.prefix + command_event.interface.args[0]} Help!\n\n`;
					var command = this.commands.find(x => x.name === this.prefix + command_event.interface.args[0]);

					if (command !== undefined) {
						if (command.help_long !== undefined) {
							help_message += `${command.help_long}`;
						} else {
							return command_event.interface.send_message("No help available for this command");
						}

						return command_event.interface.send_message(help_message);
					} else {
						return command_event.interface.send_message("Command not found!");
					}
				
				default:
					return command_event.interface.send_message("Do you relay need help with help!");
			}
		} else {
			var command = this.commands.find(x => x.name === command_event.interface.command);

			if (command === undefined) {
				return;
			}

			if (!check_permission(command_event.interface.user, "blacklist")) {
				if (check_permission(command_event.interface.user, command.perm)) {
					var result = await command.executor.execute(command_event);

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

export var command_manager: CommandManager;
export function init_command_manager(prefix: string): void {
	log("command", "Initializing command manager with prefix " + prefix);

	command_manager = new CommandManager(prefix);
}