import { CommandEvent } from "../../command/command.ts";
import { event } from "../../event/event.ts";
import { EventHandler } from "../../event/event_handler.ts";
import { loadable } from "../../loadable.ts";
import { TicTacToeAi } from "./ai.ts";
import { TicTacToeFields } from "./fields.ts";
import { add_parser, try_parse } from "./parser.ts";
import { EmojiTicTacToeParser } from "./parser/emoji_parser.ts";

export function init_tic_tac_toe() {
	var chat_ids = [ "1065676335541927976" ]; // TODO make this user configurable

	var handler: EventHandler<CommandEvent> = {
		name: "on_message_ce",
		async executor(ce: CommandEvent) {
			if (chat_ids.includes(ce.interface.chat_id)) {
				let parser = try_parse(ce.interface.message);

				if (parser) {
					let ai = new TicTacToeAi(parser.get_field());

					let move = ai.get_move();

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

