import { assert } from "https://deno.land/std@0.152.0/_util/assert.ts";
import { do_filter, do_jail } from "./jail.ts";
import { run } from "./run.ts";

interface Compilers {
	[compiler: string]: {
		file_extension: string;
		flags: string;
		is_interpreted: boolean;
		post_compile: string | undefined;
		cleanup: string | undefined;
	};
}

let compilers: Compilers | undefined = undefined;

function get_compilers(): Compilers {
	if (!compilers) {
		console.log("Loading compilers...");
		compilers = JSON.parse(Deno.readTextFileSync("./compilers.json")) as Compilers;
		console.log("Loaded " + Object.keys(compilers).length + " compilers.");
	}

	return compilers;
}

export async function compile_and_run(file: string, code: string) {
	file = "/tmp/" + file;
	do_filter(file);

	Deno.writeTextFileSync(file, code);

	var compilers = get_compilers();
	for (let i in compilers) {
		var compiler = compilers[i];

		if (file.endsWith(compiler.file_extension)) {
			console.log("Using " + i);

			if (compiler.is_interpreted) {
				var exec_cmd = i + " " + compiler.flags;
				exec_cmd = exec_cmd.replace(/%in%/g, file);
				return run(do_jail(exec_cmd));
			} else {
				var step0_cmd = i + " " + compiler.flags;
				step0_cmd = step0_cmd.replace(/%in%/g, file);
				step0_cmd = step0_cmd.replace(/%out%/g, file + ".elf");
				var step0_proc = run(step0_cmd);
				assert((await step0_proc.status()).success);
				step0_proc.close();

				var step1_cmd = compiler.post_compile;
				assert(step1_cmd);
				step1_cmd = step1_cmd.replace(/%in%/g, file);
				step1_cmd = step1_cmd.replace(/%out%/g, file + ".elf");
				var step1_proc = run(step1_cmd);
				assert((await step1_proc.status()).success);
				step1_proc.close();

				var proc = run(do_jail(file + ".elf"));
				await proc.status();

				var cleanup_cmd = compiler.cleanup;
				assert(cleanup_cmd);
				cleanup_cmd = cleanup_cmd.replace(/%in%/g, file);
				cleanup_cmd = cleanup_cmd.replace(/%out%/g, file + ".elf");
				console.log("Compiler cleanup 1: " + cleanup_cmd);
				var cleanup_proc = run(step1_cmd);
				assert((await cleanup_proc.status()).success);
				cleanup_proc.close();

				Deno.removeSync(file);

				return proc;
			}
		}
	}

	throw new Error("No matching compiler found!");
}
