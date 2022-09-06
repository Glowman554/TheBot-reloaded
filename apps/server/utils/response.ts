import { CommandResponse } from "../command/command.ts";

export function response(txt: string): CommandResponse {
	return {
		is_response: true,
		response: txt,
	};
}
