import { connection } from "bot_server_client/client.js";
import { helper } from "bot_server_client/protocol.js";

export class InternalCommands {
	/**
	 * @type {{ name: string, executor(input: string[]): Promise<string> }[]} commands
	 */
	commands;

	/**
	 * @type {string} prefix
	 */
	prefix;

	/**
	 * @param {string} owner
	 * @param {string | undefined} prefix
	 */
	constructor(owner, prefix) {
		this.owner = owner;
		this.commands = [];

		if (prefix) {
			this.prefix = prefix;
		} else {
			helper.config_get("root", "prefix", connection).then((res) => {
				this.prefix = "i!" + prefix;
			});
		}

		this.add({
			name: "help",
			executor: async (input) => {
				if (input.length != 0) {
					return "are you too dumb to use help?";
				}

				var help = "Internal help:\n";
				this.commands.forEach((cmd) => help += "- " + this.prefix + cmd.name + "\n");
				return help;
			},
		});
	}

	/**
	 * @param {string} user
	 * @param {string} message
	 * @returns {Promise<string | undefined>}
	 */
	async handle(user, message) {
		var split = message.split(" ");
		if (split[0].startsWith(this.prefix)) {
			if (user != this.owner) {
				return "wtf you aren't allowed to use this!";
			}

			var cmd = split.shift().replace(this.prefix, "");

			var command = this.commands.find((command) => command.name == cmd);
			if (command) {
				return command.executor(split);
			} else {
				return "Command " + cmd + " not found!";
			}
		}

		return undefined;
	}

	/**
	 * @param {{ name: string, executor(input: string[]): Promise<string> }} command
	 */
	add(command) {
		this.commands.push(command);
	}
}
