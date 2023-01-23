import { Command, CommandEvent, CommandExecutor, CommandResponse, command_manager, fail } from "../../command/command.ts";
import { keystore_get, keystore_set } from "../../config/keystore.ts";
import { event } from "../../event/event.ts";
import { EventHandler } from "../../event/event_handler.ts";
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { TicTacToeAi } from "./ai.ts";
import { TicTacToeFields } from "./fields.ts";
import { add_parser, try_parse } from "./parser.ts";
import { EmojiTicTacToeParser } from "./parser/emoji_parser.ts";

export function init_tic_tac_toe() {
	const chat_ids = (keystore_get("tic_tac_toe_chat_ids") ?? "").split(";");

	command_manager.add_command(
		new Command("tic_tac_toe", "Enable / disable tic tac toe in this chat!", help_text("Use '<prefix>tic_tac_toe' [enable/disable] to Enable / disable tic tac toe in this chat!"), {
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

				keystore_set("tic_tac_toe_chat_ids", chat_ids.join(";"));

				return {
					is_response: true,
					response: "OK"
				}
			},
		} as CommandExecutor, undefined),
	);

	const handler: EventHandler<CommandEvent> = {
		name: "on_message_ce",
		// deno-lint-ignore require-await
		async executor(ce: CommandEvent) {
			if (chat_ids.includes(ce.interface.chat_id)) {
				const parser = try_parse(ce.interface.message);

				if (parser) {
					const ai = new TicTacToeAi(parser.get_field());

					const move = ai.get_move();

					if (move.x == -1 || move.y == -1) {
						ce.interface.send_message("GG");
					} else {
						parser.get_field()[move.x][move.y] = TicTacToeFields.FIELD_O;

						ce.interface.send_message(parser.str());
						
						if (ai.is_game_over().over) {
							if (ai.is_game_over().winner == TicTacToeFields.FIELD_X) {
								ce.interface.send_message("You won! How???");
							} else {
								ce.interface.send_message("I won!");
							}
						}
					}
				}
			}
		},
	};

	event.add(handler);
}

export default class TicTacToe implements loadable {
	load(): void {
		add_parser(new EmojiTicTacToeParser());
		init_tic_tac_toe();
	}
}

