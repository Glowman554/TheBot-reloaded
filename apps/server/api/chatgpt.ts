import { config } from "../config/config.ts";

export interface ChatGPTMessage {
	role: "user" | "system";
	content: string;
}

export interface ChatGPTChoice {
	index: number;
	message: ChatGPTMessage;
	finish_reason: string;
}

export async function get_response_gpt(chat: ChatGPTMessage[]): Promise<ChatGPTMessage> {
	const key = config.get("key", "openai");

	const body = {
		model: "gpt-3.5-turbo",
		messages: chat,
		max_tokens: 1024,
	};

	const res = await (await fetch(`https://api.openai.com/v1/chat/completions`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + key,
		},
		body: JSON.stringify(body),
	})).json() as {
		choices: ChatGPTChoice[];
		error?: {
			message: string;
		};
	};

	// console.log(res);

	// if (res.error) {
	// 	throw new Error(res.error.message);
	// }

	return res.choices[0].message;
}
