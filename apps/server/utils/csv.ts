export class Csv {
	document: string;
	parsed_document: string[][];

	constructor(document = "") {
		this.document = document;
		this.parsed_document = [];
	}

	parse() {
		this.parsed_document = this.document.split("\n").map((row) => {
			return row.split(",");
		});

		return this.parsed_document;
	}

	serialize(separator = ",") {
		return this.parsed_document.map((row) => {
			return row.join(separator);
		}).join("\n");
	}

	get_cell(row: number, column: number) {
		return this.parsed_document[row][column];
	}

	set_cell(row: number, column: number, value: string) {
		this.parsed_document[row][column] = value;
	}

	get_row(row: number) {
		return this.parsed_document[row];
	}

	set_row(row: number, values: string[]) {
		this.parsed_document[row] = values;
	}

	get_row_count() {
		return this.parsed_document.length;
	}

	push_row(values: string[]) {
		this.parsed_document.push(values);
	}

	query_first(search: string, column: number) {
		return this.parsed_document.find((row) => row[column].indexOf(search) != -1);
	}

	query(search: string, column: number) {
		var rows_found: string[][] = [];

		this.parsed_document.forEach((row) => {
			if (row[column].indexOf(search) != -1) {
				rows_found.push(row);
			}
		});

		return rows_found;
	}

	str() {
		/**
		return this:
		|test1     |test2     |
		|----------|----------|
		|testvalue1|testvalue2|
		|testvalue3|testvalue4|
		|----------|----------|
		 */

		var max_column_lengths: number[] = [];

		this.parsed_document.forEach((row) => {
			row.forEach((cell, column) => {
				if (!max_column_lengths[column]) {
					max_column_lengths[column] = 0;
				}

				if (cell.length > max_column_lengths[column]) {
					max_column_lengths[column] = cell.length;
				}
			});
		});

		var str = "";

		this.parsed_document.forEach((row, row_index) => {
			str += "|";

			row.forEach((cell, column_index) => {
				var cell_length = cell.length;

				if (cell_length < max_column_lengths[column_index]) {
					cell += Array(max_column_lengths[column_index] - cell_length + 1).join(cell.trim() == "" ? "-" : " ");
				}

				str += cell + "|";
			});

			if (row_index < this.parsed_document.length - 1) {
				str += "\n";
			}
		});

		str += "\n|";

		max_column_lengths.forEach((length) => {
			str += Array(length + 1).join("-") + "|";
		});

		return str;
	}
}

export function test_csv() {
	var csv_parser = new Csv();

	csv_parser.push_row(["test1", "test2"]);
	csv_parser.push_row(["", ""]);
	csv_parser.push_row(["testvalue1", "testvalue2"]);
	csv_parser.push_row(["testvalue3", "testvalue4"]);

	console.log(csv_parser.str());
	console.log(csv_parser.serialize());

	console.log(csv_parser.query("testvalue", 0));
}
