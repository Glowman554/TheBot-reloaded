import { Anime, AnimeProvider } from "../index.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";



export class Gogoanime implements AnimeProvider {
    base_url: string;

    constructor() {
		this.base_url = 'https://gogoanime.pe/';
	}

    async query(q: string): Promise<Anime[]> {
		var search_res = await (await fetch(this.base_url + '/search.html?keyword=' + encodeURIComponent(q))).text();

		var search_res_dom = new DOMParser().parseFromString(search_res, 'text/html');
        if (!search_res_dom) throw new Error("Failed to query!");
        
		var search_res_list = search_res_dom.querySelectorAll('ul.items > li > p > a');

		var results: Anime[] = [];

		for (var i = 0; i < search_res_list.length; i++) {
			var href = (search_res_list[i] as Element).getAttribute("href")?.replace((search_res_list[i] as Element).getAttribute("origin") || "", this.base_url);
            if (!href) throw new Error("Failed to query!");

			var anime_site_text = await (await fetch(href)).text();
			var anime_site_dom = new DOMParser().parseFromString(anime_site_text, 'text/html');
            if (!anime_site_dom) throw new Error("Failed to query!");


			var anime_info = anime_site_dom.querySelector('.anime_info_body_bg');
            if (!anime_info) throw new Error("Failed to query!");


			var title = anime_info.querySelector('h1')?.textContent;
			var poster = anime_info.querySelector('img')?.getAttribute("src");

			var episodes_element = anime_site_dom.querySelector('#episode_page > li > a');
            if (!episodes_element) throw new Error("Failed to query!");

			var num_episodes = parseInt(episodes_element.getAttribute("ep_end") || "0");

			results.push(new Anime(title || "null", num_episodes, poster || "null", href));
		}

		return results;
    }
}