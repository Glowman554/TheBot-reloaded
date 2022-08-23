import { serve } from "https://deno.land/std/http/mod.ts";
import { create, set_logger } from "https://deno.land/x/simple_router@0.2/mod.ts";
import { do_filter, do_jail } from "./jail.ts";
import { run } from "./run.ts";

async function main() {
	set_logger({
		logger: console.log,
	});

	const { router, reqHandler } = create();

	router.add("/", async (req) => {
		return new Response(`Hello World\n`);
	}, "GET");

	router.add("/compiler/run", async (req) => {
		var proc = run(do_jail(do_filter(await req.text())));
		var status = await proc.status();
		var stdout = new TextDecoder().decode(await proc.output());
		var stderr = new TextDecoder().decode(await proc.stderrOutput());

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

		return new Response(JSON.stringify({
			stderr: stderr,
			stdout: stdout,
			status: status,
		}));
	}, "POST");

	router.add("/compiler/compile", async (req) => {
		console.log(await req.text());
		return new Response("this is a stub and not yet implemented!");
	}, "POST");

	serve(reqHandler, {
		port: 0xded + 1,
		onListen: (params) => {
			console.log("Listening on " + params.hostname + ":" + params.port);
		},
	});
}

main();
