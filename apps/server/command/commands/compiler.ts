import { compiler, CompilerResult, init_compiler_api } from "../../api/compiler.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, empty, fail } from "../command.ts";
import { check_permission } from "../permission.ts";

export default class Compiler implements loadable {
	load(): void {
		init_compiler_api(config.get("server", "compiler") as string);

		command_manager.add_command(
			new Command("run", "", "", {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length < 1) {
						return fail;
					}

					var result: CompilerResult;
					if (check_permission(event.interface.user, "run-nojail")) {
						result = await compiler.run_nojail(event.interface.args.join(" "));
					} else {
						result = await compiler.run(event.interface.args.join(" "));
					}

					return {
						is_response: true,
						response: result.stdout + (result.stderr != "" ? ("\nSTDERR: \n" + result.stderr) : ""),
					};
				},
			} as CommandExecutor, undefined),
		);
	}
}
