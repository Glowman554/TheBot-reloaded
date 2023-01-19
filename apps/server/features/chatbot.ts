import { Command, CommandEvent, CommandExecutor, CommandResponse, command_manager, fail } from "../command/command.ts";
import { config } from "../config/config.ts";
import { event } from "../event/event.ts";
import { EventHandler } from "../event/event_handler.ts";
import { loadable } from "../loadable.ts";
import { get_response } from "../api/chatbot.ts";
import { help_text } from "../utils/help.ts";
import { keystore_get, keystore_set } from "../config/keystore.ts";

export function init_chatbot() {
	var chat_ids = (keystore_get("chatbot_chat_ids") ?? "").split(";");

	command_manager.add_command(
		new Command("chatbot", "Enable / disable the chatbot in this chat!", help_text("Use '<prefix>chatbot' [enable/disable] to Enable / disable the chatbot in this chat!"), {
			execute: async (event: CommandEvent): Promise<CommandResponse> => {
				if (event.interface.args.length != 1) {
					return fail;
				}

				if (event.interface.args[0] == "enable") {
					if (!chat_ids.includes(event.interface.chat_id)) {
						chat_ids.push(event.interface.chat_id);
					}
				} else {
					if (chat_ids.includes(event.interface.chat_id)) {
						chat_ids.splice(chat_ids.indexOf(event.interface.chat_id), 1);
					}
				}

				keystore_set("chatbot_chat_ids", chat_ids.join(";"));

				return {
					is_response: true,
					response: "OK"
				}
			},
		} as CommandExecutor, undefined),
	);
	
	var handler: EventHandler<CommandEvent> = {
		name: "on_message_ce",
		async executor(ce: CommandEvent) {
			if (chat_ids.includes(ce.interface.chat_id)) {
				await ce.interface.send_message(await get_response(ce.interface.message, ce.interface.chat_id));
			}
		},
	};

	event.add(handler);
}

export default class Chatbot implements loadable {
	load(): void {
		init_chatbot();
	}
}

