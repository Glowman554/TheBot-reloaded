import { TicTacToeFields } from "../fields.ts";
import { TicTacToeParser } from "../parser.ts";

export class EmojiTicTacToeParser implements TicTacToeParser {
	field: TicTacToeFields[][];

	constructor() {
		this.field = [];

		this.reset();
	}

	parse(s: string): boolean {
		const split = s.split("\n");
		if (split.length != 3) {
			return false;
		}

		for (let i = 0; i < split.length; i++) {
			const line = split[i].replaceAll(" ", "").split("");
			if (line.length != 3) {
				return false;
			}

			for (let j = 0; j < line.length; j++) {
				switch (line[j]) {
					case "❔":
					case "❓":
						this.field[i][j] = TicTacToeFields.FIELD_EMPTY;
						break;
					case "⭕":
						this.field[i][j] = TicTacToeFields.FIELD_O;
						break;
					case "❌":
						this.field[i][j] = TicTacToeFields.FIELD_X;
						break;
					default:
						return false;
				}
			}
		}

		return true;
	}

	str(): string {
		let ret = "";
		for (let i = 0; i < this.field.length; i++) {
			for (let j = 0; j < this.field[i].length; j++) {
				switch (this.field[i][j]) {
					case TicTacToeFields.FIELD_EMPTY:
						ret += "❔";
						break;
					case TicTacToeFields.FIELD_O:
						ret += "⭕";
						break;
					case TicTacToeFields.FIELD_X:
						ret += "❌";
						break;
				}
				ret += " ";
			}
			ret += "\n";
		}

		return ret;
	}

	get_field(): TicTacToeFields[][] {
		return this.field;
	}

	reset(): void {
		this.field = [
			[TicTacToeFields.FIELD_EMPTY, TicTacToeFields.FIELD_EMPTY, TicTacToeFields.FIELD_EMPTY],
			[TicTacToeFields.FIELD_EMPTY, TicTacToeFields.FIELD_EMPTY, TicTacToeFields.FIELD_EMPTY],
			[TicTacToeFields.FIELD_EMPTY, TicTacToeFields.FIELD_EMPTY, TicTacToeFields.FIELD_EMPTY],
		];
	}
}
