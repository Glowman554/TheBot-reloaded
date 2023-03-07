import { Command, CommandEvent, CommandExecutor, CommandResponse, command_manager, fail } from "../command/command.ts";
import { event } from "../event/event.ts";
import { EventHandler } from "../event/event_handler.ts";
import { loadable } from "../loadable.ts";
import { get_response } from "../api/chatgpt.ts";
import { help_text } from "../utils/help.ts";
import { keystore_get, keystore_set } from "../config/keystore.ts";
import { ChatGPTMessage } from "../api/chatgpt.ts";
import { log } from "../logger.ts";

const chats: {
	[id: string]: ChatGPTMessage[]
} = {};

function clean_chats() {
	for (const id in chats) {
		let to_be_removed = Math.max(chats[id].length - 50, 0);
		log("chatbotv2", `Removing ${to_be_removed} elements from chat ${id}`)
		for (let i = 0; i < to_be_removed; i++) {
			chats[id].shift();
		}
	}
}

export function init_chatbotv2() {
	const chat_ids = (keystore_get("chatbotv2_chat_ids") ?? "").split(";");

	command_manager.add_command(
		new Command("chatbotv2", "Enable / disable the chatbot in this chat!", help_text("Use '<prefix>chatbotv2' [enable/disable] to Enable / disable the chatbot in this chat!"), {
			// deno-lint-ignore require-await
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

				keystore_set("chatbotv2_chat_ids", chat_ids.join(";"));

				return {
					is_response: true,
					response: "OK"
				}
			},
		} as CommandExecutor, undefined),
	);
	
	const handler: EventHandler<CommandEvent> = {
		name: "on_message_ce",
		async executor(ce: CommandEvent) {
			clean_chats();
			if (chat_ids.includes(ce.interface.chat_id)) {
				if (ce.interface.message.trim() == "reset") {
					delete chats[ce.interface.chat_id];
					ce.interface.send_message("Resetting conversation...");
					return;
				}
				if (!chats[ce.interface.chat_id]) {
					chats[ce.interface.chat_id] = [];
				}

				chats[ce.interface.chat_id].push({
					role: "user",
					content: ce.interface.message
				});


				const res = await get_response(chats[ce.interface.chat_id]);
				chats[ce.interface.chat_id].push(res);

				ce.interface.send_message(res.content);
			}
		},
	};

	event.add(handler);
}

export default class ChatbotV2 implements loadable {
	load(): void {
		init_chatbotv2();
	}
}

