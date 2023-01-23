import { compiler, CompilerResult, init_compiler_api } from "../../api/compiler.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";
import { check_permission } from "../permission.ts";

export default class Compiler implements loadable {
	load(): void {
		init_compiler_api(config.get("server", "compiler") as string);

		command_manager.add_command(
			new Command("run", "Run a command!", help_text("Use '<prefix>run [command?]' to run the command or the quoted text!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (!event._1_arg_or_quote_text()) {
						return fail;
					}

					let result: CompilerResult;
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

		command_manager.add_command(
			new Command("compile", "Compile and run a file!", help_text("Use '<prefix>compile' to compile and run the attached or quoted file!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0 || event.interface.files == undefined || event.interface.files.length == 0) {
						return fail;
					}

					const result = await compiler.compile_and_run(event.interface.files[0]);

					return {
						is_response: true,
						response: result.stdout + (result.stderr != "" ? ("\nSTDERR: \n" + result.stderr) : ""),
					};
				},
			} as CommandExecutor, undefined),
		);
	}
}
