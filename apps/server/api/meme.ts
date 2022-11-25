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
    var meme = await (await fetch("https://meme-api.herokuapp.com/gimme")).json() as Meme;
    return meme.url;
}
