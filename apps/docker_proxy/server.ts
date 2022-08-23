import { serve } from "https://deno.land/std/http/mod.ts";
import { set_logger, create } from "https://deno.land/x/simple_router@0.1/mod.ts";

import * as docker from "./docker.ts";

async function main() {
	docker.init();

	set_logger({
		logger: console.log,
	});

	const { router, reqHandler } = create();

	router.add("/", async (req) => {
		return new Response(`Hello World\n`);
	}, "GET");

	docker.get_handlers().forEach((r) => router.add(r.path, r.handler, r.method));

	serve(reqHandler, {
		port: 0xded,
		onListen: (params) => {
			console.log("Listening on " + params.hostname + ":" + params.port);
		},
	});
}

main();

