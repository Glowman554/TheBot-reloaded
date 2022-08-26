import { serve } from "https://deno.land/std/http/mod.ts";
import { create, ErrorMode, set_logger } from "https://deno.land/x/simple_router@0.7/mod.ts";
import { compile_and_run } from "./compiler.ts";
import { do_filter, do_jail } from "./jail.ts";
import { run } from "./run.ts";

async function main() {
	set_logger({
		logger: console.log,
	});

	const { router, reqHandler } = create(ErrorMode.ERROR_JSON);

	router.add("/", async (req) => {
		return new Response(`Hello World\n`);
	}, "GET");

	router.add("/compiler/run", async (req) => {
		var proc = run(do_jail(do_filter(await req.text())));
		var status = await proc.status();
		var stdout = new TextDecoder().decode(await proc.output());
		var stderr = new TextDecoder().decode(await proc.stderrOutput());
		proc.close();

		return new Response(JSON.stringify({
			stderr: stderr,
			stdout: stdout,
			status: status,
		}));
	}, "POST");

	router.add("/compiler/run-nojail", async (req) => {
		var proc = run(await req.text());
		var status = await proc.status();
		var stdout = new TextDecoder().decode(await proc.output());
		var stderr = new TextDecoder().decode(await proc.stderrOutput());
		proc.close();

		return new Response(JSON.stringify({
			stderr: stderr,
			stdout: stdout,
			status: status,
		}));
	}, "POST");

	router.add("/compiler/compile", async (req) => {
		var json = await req.json() as {
			prog: string;
			file: string;
		};

		var proc = await compile_and_run(json.file, json.prog);
		var status = await proc.status();
		var stdout = new TextDecoder().decode(await proc.output());
		var stderr = new TextDecoder().decode(await proc.stderrOutput());
		proc.close();

		return new Response(JSON.stringify({
			stderr: stderr,
			stdout: stdout,
			status: status,
		}));
	}, "POST");

	serve(reqHandler, {
		port: 0xded + 1,
		onListen: (params) => {
			console.log("Listening on " + params.hostname + ":" + params.port);
		},
	});
}

main();
