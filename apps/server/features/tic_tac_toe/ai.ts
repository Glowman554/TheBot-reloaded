import { TicTacToeFields } from "./fields.ts";

interface IsGameOverReturn {
	over: boolean;
	winner: TicTacToeFields | null;
}

interface Move {
	x: number;
	y: number;
}

export class TicTacToeAi {
	field: TicTacToeFields[][];

	constructor(field: TicTacToeFields[][]) {
		this.field = field;
		
		if (this.field.length != 3 || this.field[0].length != 3) {
			throw new Error("Invalid size!");
		}
	}

	is_game_over(): IsGameOverReturn {
		for (let i = 0; i < this.field.length; i++) {
			if (this.field[i][0] != TicTacToeFields.FIELD_EMPTY && this.field[i][0] == this.field[i][1] && this.field[i][1] == this.field[i][2]) {
				return {
					over: true,
					winner: this.field[i][0]
				};
			}
		}

		// check columns
		for (let i = 0; i < this.field[0].length; i++) {
			if (this.field[0][i] != TicTacToeFields.FIELD_EMPTY && this.field[0][i] == this.field[1][i] && this.field[1][i] == this.field[2][i]) {
				return {
					over: true,
					winner: this.field[0][i]
				};
			}
		}

		// check diagonals
		if (this.field[0][0] != TicTacToeFields.FIELD_EMPTY && this.field[0][0] == this.field[1][1] && this.field[1][1] == this.field[2][2]) {
			return {
				over: true,
				winner: this.field[0][0]
			};
		}

		if (this.field[0][2] != TicTacToeFields.FIELD_EMPTY && this.field[0][2] == this.field[1][1] && this.field[1][1] == this.field[2][0]) {
			return {
				over: true,
				winner: this.field[0][2]
			};
		}

		// check if there is any empty field
		for (let i = 0; i < this.field.length; i++) {
			for (let j = 0; j < this.field[i].length; j++) {
				if (this.field[i][j] == TicTacToeFields.FIELD_EMPTY) {
					return {
						over: false,
						winner: null
					};
				}
			}
		}

		return {
			over: true,
			winner: null
		};
	}

	private minmax(player: TicTacToeFields, depth: number, is_maximizing: boolean): number {
		const game_over = this.is_game_over();

		if (game_over.over) {
			if (game_over.winner == TicTacToeFields.FIELD_X) {
				return -10 + depth;
			} else if (game_over.winner == TicTacToeFields.FIELD_O) {
				return 10 - depth;
			} else {
				return 0;
			}
		}

		if (is_maximizing) {
			let best = -1000;
			for (let i = 0; i < this.field.length; i++) {
				for (let j = 0; j < this.field[i].length; j++) {
					if (this.field[i][j] == TicTacToeFields.FIELD_EMPTY) {
						this.field[i][j] = player;
						best = Math.max(best, this.minmax(player == TicTacToeFields.FIELD_X ? TicTacToeFields.FIELD_O : TicTacToeFields.FIELD_X, depth + 1, false));
						this.field[i][j] = TicTacToeFields.FIELD_EMPTY;
					}
				}
			}
			return best;
		} else {
			let best = 1000;
			for (let i = 0; i < this.field.length; i++) {
				for (let j = 0; j < this.field[i].length; j++) {
					if (this.field[i][j] == TicTacToeFields.FIELD_EMPTY) {
						this.field[i][j] = player;
						best = Math.min(best, this.minmax(player == TicTacToeFields.FIELD_X ? TicTacToeFields.FIELD_O : TicTacToeFields.FIELD_X, depth + 1, true));
						this.field[i][j] = TicTacToeFields.FIELD_EMPTY;
					}
				}
			}
			return best;
		}
	}

	get_move(): Move {
		let best_score = -1000;
		let best_x = -1;
		let best_y = -1;

		for (let i = 0; i < this.field.length; i++) {
			for (let j = 0; j < this.field[i].length; j++) {
				if (this.field[i][j] == TicTacToeFields.FIELD_EMPTY) {
					this.field[i][j] = TicTacToeFields.FIELD_O;
					const score = this.minmax(TicTacToeFields.FIELD_X, 0, false);
					this.field[i][j] = TicTacToeFields.FIELD_EMPTY;

					if (score > best_score) {
						best_score = score;
						best_x = i;
						best_y = j;
					}
				}
			}
		}

		if (best_x != -1 && best_y != -1) {
			this.field[best_x][best_y] = TicTacToeFields.FIELD_O;
		}

		return {
			x: best_x,
			y: best_y
		};
	}
}