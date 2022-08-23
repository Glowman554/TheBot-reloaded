import { init_compiler_api, compiler } from "../../api/compiler.ts";
import { loadable } from "../../loadable.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";

export default class Compiler implements loadable {
	load(): void {
		init_compiler_api("http://compiler_server:3566/compiler");
	}
}
