import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command/command.ts";
import { event } from "../event/event.ts";
import { EventHandler } from "../event/event_handler.ts";
import { loadable } from "../loadable.ts";
import { get_response } from "../api/chatbot.ts";
import { get_response_gpt } from "../api/chatgpt.ts";
import { help_text } from "../utils/help.ts";
import { keystore_get, keystore_set } from "../config/keystore.ts";
import { ChatGPTMessage } from "../api/chatgpt.ts";
import { log } from "../logger.ts";
import { get_response_alice } from "../api/alice.ts";

const chats: {
	[id: string]: ChatGPTMessage[];
} = {};

function clean_chats() {
	for (const id in chats) {
		let to_be_removed = Math.max(chats[id].length - 10, 0);
		log("chatbot", `Removing ${to_be_removed} elements from chat ${id}`);
		for (let i = 0; i < to_be_removed; i++) {
			chats[id].shift();
		}
	}
}

interface ChatbotChatIds {
	type: string;
	id: string;
}

export function init_chatbot() {
	const ks = keystore_get("chatbot_chat_ids");
	const chat_ids = (ks ? ks.split(";") : []).map((v) => JSON.parse(v)) as ChatbotChatIds[];

	command_manager.add_command(
		new Command("chatbot", "Enable / disable the chatbot in this chat!", help_text("Use '<prefix>chatbot' [enable/disable] [chatgpt/brainshop/alice] to Enable / disable the chatbot in this chat!"), {
			// deno-lint-ignore require-await
			execute: async (event: CommandEvent): Promise<CommandResponse> => {
				if (event.interface.args.length != 2) {
					return fail;
				}

				const chatbot_type = event.interface.args[1];
				if ((chatbot_type != "chatgpt") && (chatbot_type != "brainshop") && (chatbot_type != "alice")) {
					return {
						is_response: true,
						response: "Unknown chatbot type",
					};
				}

				if (event.interface.args[0] == "enable") {
					if (!chat_ids.find((v) => (v.id == event.interface.chat_id) && (v.type == chatbot_type))) {
						chat_ids.push({
							type: chatbot_type,
							id: event.interface.chat_id,
						});
					} else {
						return {
							is_response: true,
							response: "Already enabled!",
						};
					}
				} else {
					if (chat_ids.find((v) => (v.id == event.interface.chat_id) && (v.type == chatbot_type))) {
						chat_ids.splice(chat_ids.findIndex((v) => (v.id == event.interface.chat_id) && (v.type == chatbot_type)), 1);
					} else {
						return {
							is_response: true,
							response: "Already disabled!",
						};
					}
				}

				keystore_set("chatbot_chat_ids", chat_ids.map((v) => JSON.stringify(v)).join(";"));

				return {
					is_response: true,
					response: "OK",
				};
			},
		} as CommandExecutor, undefined),
	);

	const handler: EventHandler<CommandEvent> = {
		name: "on_message_ce",
		async executor(ce: CommandEvent) {
			let bot = chat_ids.filter((v) => v.id == ce.interface.chat_id);
			for (const i of bot) {
				switch (i.type) {
					case "chatgpt":
						{
							clean_chats();
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
								content: ce.interface.message,
							});

							try {
								const res = await get_response_gpt(chats[ce.interface.chat_id]);
								chats[ce.interface.chat_id].push(res);

								ce.interface.send_message(res.content);
							} catch (e) {
								ce.interface.send_message("Could not generate response: " + e + "\nMaybe wait a few minutes? It might help!");
								delete chats[ce.interface.chat_id];
							}
						}
						break;
					case "brainshop":
						await ce.interface.send_message(await get_response(ce.interface.message, ce.interface.chat_id));
						break;
					case "alice":
						await ce.interface.send_message(await get_response_alice(ce.interface.message, ce.interface.chat_id));
						break;
				}
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
