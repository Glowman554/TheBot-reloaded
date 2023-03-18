export interface Meme {
	postLink: string;
	subreddit: string;
	title: string;
	url: string;
	nsfw: boolean;
	spoiler: boolean;
	author: string;
	ups: number;
	preview: string[];
}

export async function get_meme(): Promise<string> {
	const meme = await (await fetch("https://meme-api.com/gimme")).json() as Meme;
	return meme.url;
}
