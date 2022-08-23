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
					if (!event._1_arg_or_quote_text()) {
						return fail;
					}

					var result: CompilerResult;
					if (check_permission(event.interface.user, "run-nojail")) {
						result = await compiler.run_nojail(event.get_args_or_quote().join(" "));
					} else {
						result = await compiler.run(event.get_args_or_quote().join(" "));
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
