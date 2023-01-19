import { config } from "../config/config.ts";

export async function get_response(message: string, chat: string): Promise<string> {
    let key = config.get("key", "chatbot");
    let bid = config.get("bid", "chatbot");


	var res = await (await fetch(`http://api.brainshop.ai/get?bid=${bid}&key=${key}&uid=${encodeURIComponent(chat)}&msg=${encodeURIComponent(message)}`)).json() as {
		cnt: string;
	};

	return res.cnt.replace(/<[\w/]*>/g, "");
}