// deno-lint-ignore-file no-explicit-any
export interface Image {
	artists: string[];
	sources: string[];
	width: number;
	height: number;
	url: string;
	yiffMediaURL: string;
	type: string;
	name: string;
	id: string;
	ext: string;
	size: number;
	reportURL?: any;
	shortURL: string;
}

export interface Info {
	limit: number;
	remaining: number;
	reset: number;
	resetAfter: number;
	retryAfter: number;
	precision: string;
	global: boolean;
}

export interface YiffRestResponse {
	images: Image[];
	$schema: string;
	success: boolean;
	notes: any[];

	error?: string;
	info?: Info;
}

export class FurryApi {
	_methods = [
		"animals/birb",
		"animals/blep",
		"furry/boop",
		"furry/cuddle",
		"furry/flop",
		"furry/fursuit",
		"furry/hold",
		"furry/howl",
		"furry/hug",
		"furry/kiss",
		"furry/lick",
		"furry/propose",
		"furry/bulge",
		"furry/yiff/gay",
		"furry/yiff/straight",
		"furry/yiff/lesbian",
		"furry/yiff/gynomorph",
	];

	methods: { [key: string]: () => Promise<string> } = {};

	constructor() {
		this._methods.forEach((m) => {
			this.methods[m] = () => {
				return this.random_image(m);
			};
		});
	}

	async random_image(method: string): Promise<string> {
		while (true) {
			const res = await (await fetch(`https://v2.yiff.rest/${method}?limit=1&notes=disabled`, {
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41",
				},
			})).json() as YiffRestResponse;
			if (!res.success) {
				if (res.info) {
					console.log(res.error);
					await new Promise((r) => setTimeout(r, (res.info?.retryAfter || 1) * 1000));
					continue;
				}
			}
			return res.images[0].url;
		}
	}
}
