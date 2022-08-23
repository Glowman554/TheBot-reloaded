import { serve } from "https://deno.land/std/http/mod.ts";
import { Router } from "./router.ts";
import * as docker from "./docker.ts";

const router = new Router();

async function reqHandler(req: Request) {
	var url = new URL(req.url);
	console.log(req.method + " " + url.pathname);

	return router.handle(req);
}

async function main() {
	docker.init();

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
