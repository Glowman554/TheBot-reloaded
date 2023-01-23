import { log } from "../logger.ts";
import { MikkiClient } from "https://deno.land/x/mikki@0.12/mod.ts";

export let mikki: MikkiClient;

export function init_mikki_api(sb_url: string, sb_token: string) {
	log("mikki", "Initializing mikki api...");
	mikki = new MikkiClient(sb_url, sb_token);
}
