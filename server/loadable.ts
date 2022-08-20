import { log } from "./logger.ts";
import utils from "./command/commands/util.ts";
import fun from "./command/commands/fun.ts";
import animals from "./command/commands/animals.ts";

export type loadable = { load(): void };

var loadables: loadable[] = [
	new utils(),
	new fun(),
	new animals()
];

export function load_all_loadables(): void {
	for (var i in loadables) {
		log("loadable", "Loading loadable " + loadables[i].constructor.name);
		loadables[i].load();
	}
}