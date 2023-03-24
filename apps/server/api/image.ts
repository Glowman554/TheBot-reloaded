import { config } from "../config/config.ts";

export interface ImageResponse {
	created: number;
	data: Images[];
}

export interface Images {
	url: string;
}

export type ImageSizes = "256x256" | "512x512" | "1024x1024";

export async function generate(prompt: string, size: ImageSizes): Promise<ImageResponse> {
	const key = config.get("key", "openai");

	const body = {
		prompt: prompt,
        n: 2,
        size: size
	};

	const res = await (await fetch(`https://api.openai.com/v1/images/generations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + key,
		},
		body: JSON.stringify(body),
	})).json() as ImageResponse;

	return res;
}
