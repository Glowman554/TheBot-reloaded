import { log } from "../../logger.ts";
import { TicTacToeFields } from "./fields.ts";

export interface TicTacToeParser {
	parse(s: string): boolean;
	str(): string;
	get_field():  TicTacToeFields[][];
	reset(): void;
};

let parsers: TicTacToeParser[] = [];

export function add_parser(parser: TicTacToeParser) {
	parsers.push(parser);

	log("tic_tac_toe", "Added parser " + parser.constructor.name + ".");
}

export function try_parse(s: string): TicTacToeParser | null {
	for (let i = 0; i < parsers.length; i++) {
		if (parsers[i].parse(s)) {
			return parsers[i];
		} else {
			parsers[i].reset();
		}
	}

	return null;
}