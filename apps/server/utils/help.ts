import { config } from "../config/config.ts";

export function help_text(text: string) {
	return text.replaceAll("<prefix>", config.get("prefix") as string).replaceAll("<bot_name>", "TheBot");
}
