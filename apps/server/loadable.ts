import { log } from "./logger.ts";
import utils from "./command/commands/util.ts";
import fun from "./command/commands/fun.ts";
import animals from "./command/commands/animals.ts";
import docker from "./command/commands/docker.ts";
import compiler from "./command/commands/compiler.ts";
import mikki from "./command/commands/mikki.ts";
import hello from "./features/hello.ts";
import chatbot from "./features/chatbot.ts";
import tic_tac_toe from "./features/tic_tac_toe/handler.ts";
import anime from "./command/commands/anime.ts";
import repeat from "./command/commands/repeat.ts";
import version from "./command/commands/version.ts";
import sticker from "./command/commands/sticker.ts";
import todo from "./command/commands/todo.ts";
import untis from "./command/commands/untis.ts";

export type loadable = { load(): void };

const loadables: loadable[] = [
	new utils(),
	new fun(),
	new animals(),
	new docker(),
	new compiler(),
	new mikki(),
	new hello(),
	new anime(),
	new repeat(),
	new chatbot(),
	new tic_tac_toe(),
	new version(),
	new sticker(),
	new todo(),
	new untis(),
];

export function load_all_loadables(): void {
	for (const i in loadables) {
		log("loadable", "Loading loadable " + loadables[i].constructor.name);
		loadables[i].load();
	}
}
