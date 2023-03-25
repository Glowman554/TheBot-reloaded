import { config } from "../config/config.ts";

export async function get_response_alice(message: string, chat: string): Promise<string> {
	const url = config.get("url", "alice");

	const res = await (await fetch(`${url}?chat=${chat}&query=${message}`)).text();

	return res.replace(/<[\w/]*>/g, "");
}
