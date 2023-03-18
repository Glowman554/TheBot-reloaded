import { config } from "../config/config.ts";

export async function get_response(message: string, chat: string): Promise<string> {
	const key = config.get("key", "chatbot");
	const bid = config.get("bid", "chatbot");

	const res = await (await fetch(`http://api.brainshop.ai/get?bid=${bid}&key=${key}&uid=${encodeURIComponent(chat)}&msg=${encodeURIComponent(message)}`)).json() as {
		cnt: string;
	};

	return res.cnt.replace(/<[\w/]*>/g, "");
}
