import Docker from "https://deno.land/x/denocker@v0.2.0/index.ts";
import { Route } from "https://deno.land/x/simple_router@0.7/mod.ts";

export var docker: Docker;

export function init() {
	docker = new Docker("/var/run/docker.sock");

	(async () => {
		console.log(await list_names());
	})();
}

export async function list_names() {
	var containers: {
		name: string;
		state: string;
	}[] = [];
	var c = await docker.containers.list({
		all: true,
	});
	c.forEach((cont) => containers.push({ name: cont.Names ? cont.Names[0] : "unknown", state: cont.State || "unknown" }));
	return containers;
}

export async function name_to_id(name: string) {
	console.log("name_to_id: " + name);
	var c = await docker.containers.list({
		all: true,
	});
	var lc = c.find((cont) => cont.Names ? cont.Names[0] == name : false);
	if (lc) {
		return lc.Id || "unknown";
	} else {
		throw new Error("Container " + name + " not found");
	}
}

export async function start(name: string) {
	console.log("start: " + name);
	var id = await name_to_id(name);
	await docker.containers.start(id);
}

export async function stop(name: string) {
	console.log("stop: " + name);
	var id = await name_to_id(name);
	await docker.containers.stop(id);
}

export async function restart(name: string) {
	console.log("restart: " + name);
	var id = await name_to_id(name);
	await docker.containers.restart(id);
}

export async function remove(name: string) {
	console.log("remove: " + name);
	var id = await name_to_id(name);
	await docker.containers.rm(id);
}

export function get_handlers() {
	var handlers: Route[] = [];

	handlers.push({
		path: "/docker/list",
		handler: async (req) => {
			return new Response(JSON.stringify(await list_names(), null, "\t"));
		},
		method: "GET",
	});

	handlers.push({
		path: "/docker/start",
		handler: async (req) => {
			var url = new URL(req.url);
			var name = url.searchParams.get("name");
			if (name) {
				await start(name);
			}
			return new Response(JSON.stringify(await list_names(), null, "\t"));
		},
		method: "GET",
	});

	handlers.push({
		path: "/docker/stop",
		handler: async (req) => {
			var url = new URL(req.url);
			var name = url.searchParams.get("name");
			if (name) {
				await stop(name);
			}
			return new Response(JSON.stringify(await list_names(), null, "\t"));
		},
		method: "GET",
	});

	handlers.push({
		path: "/docker/restart",
		handler: async (req) => {
			var url = new URL(req.url);
			var name = url.searchParams.get("name");
			if (name) {
				await restart(name);
			}
			return new Response(JSON.stringify(await list_names(), null, "\t"));
		},
		method: "GET",
	});

	handlers.push({
		path: "/docker/remove",
		handler: async (req) => {
			var url = new URL(req.url);
			var name = url.searchParams.get("name");
			if (name) {
				await remove(name);
			}
			return new Response(JSON.stringify(await list_names(), null, "\t"));
		},
		method: "GET",
	});

	return handlers;
}
