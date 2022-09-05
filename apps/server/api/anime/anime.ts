import { Gogoanime } from "./provider/gogoanime.ts";

export class Anime {
	name: string;
	episodes: number;
	image: string;
	url: string;

	constructor(name: string, episodes: number, image: string, url: string) {
		this.name = name;
		this.episodes = episodes;
		this.image = image;
		this.url = url;
	}
}

export interface AnimeProvider {
	query: (q: string) => Promise<Anime[]>;
}

export { Gogoanime } from "./provider/gogoanime.ts";

var provider: { [key: string]: AnimeProvider } = {
	"gogoanime": new Gogoanime(),
};

export function query_by_name(p: string, q: string) {
	return provider[p].query(q);
}
