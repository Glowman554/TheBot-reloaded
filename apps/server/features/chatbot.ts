import { CommandEvent } from "../command/command.ts";
import { config } from "../config/config.ts";
import { event } from "../event/event.ts";
import { EventHandler } from "../event/event_handler.ts";
import { loadable } from "../loadable.ts";
import { get_response } from "../api/chatbot.ts";

export function init_chatbot() {
	var chat_ids = config.get("chat_ids", "chatbot") as string[]; // TODO make this user configurable

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

