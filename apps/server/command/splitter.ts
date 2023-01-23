export function partition(input: string, max: number) {
	if (input.length > max) {
		if (!input.endsWith("\n")) {
			input += "\n";
		}

		const res: string[] = [];

		const chunks = Math.floor(Math.ceil(input.length / max));

		for (let i = 0, o = 0; i < chunks; i++) {
			let x = input.length < o + max ? input.length - o - 1 : max;

			while (input.charAt(o + x) != "\n") {
				x--;
			}

			res.push(input.substring(o, o + x));

			o += x;
		}

		return res;
	} else {
		return [input];
	}
}
