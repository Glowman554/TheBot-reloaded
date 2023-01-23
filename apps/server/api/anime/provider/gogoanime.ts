import { Anime, AnimeProvider } from "../anime.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";

export class Gogoanime implements AnimeProvider {
	base_url: string;

	constructor() {
		this.base_url = "https://gogoanime.pe/";
	}

	async query(q: string): Promise<Anime[]> {
		const search_res = await (await fetch(this.base_url + "/search.html?keyword=" + encodeURIComponent(q))).text();

		const search_res_dom = new DOMParser().parseFromString(search_res, "text/html");
		if (!search_res_dom) throw new Error("Failed to query!");

		const search_res_list = search_res_dom.querySelectorAll("ul.items > li > p > a");

		const results: Anime[] = [];

		for (let i = 0; i < search_res_list.length; i++) {
			const href = (search_res_list[i] as Element).getAttribute("href")?.replace((search_res_list[i] as Element).getAttribute("origin") || "", this.base_url);
			if (!href) throw new Error("Failed to query!");

			const anime_site_text = await (await fetch(href)).text();
			const anime_site_dom = new DOMParser().parseFromString(anime_site_text, "text/html");
			if (!anime_site_dom) throw new Error("Failed to query!");

			const anime_info = anime_site_dom.querySelector(".anime_info_body_bg");
			if (!anime_info) throw new Error("Failed to query!");

			const title = anime_info.querySelector("h1")?.textContent;
			const poster = anime_info.querySelector("img")?.getAttribute("src");

			const episodes_element = anime_site_dom.querySelectorAll("#episode_page > li > a");

			const num_episodes = parseInt((episodes_element[episodes_element.length - 1] as Element).getAttribute("ep_end") || "0");

			results.push(new Anime(title || "null", num_episodes, poster || "null", href));
		}

		return results;
	}
}
