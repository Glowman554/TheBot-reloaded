import { log } from "../logger.ts";
interface DockerContainer {
	name: string;
	state: string;
}

export class DockerApi {
	url: string;

	constructor(url: string) {
		if (url.endsWith("/")) {
			url = url.substring(0, url.length - 1);
		}
		log("docker", "url: " + url);
		this.url = url;
	}

	async list(): Promise<DockerContainer[]> {
		log("docker", "fetching containers...");
		return await (await fetch(this.url + "/list")).json();
	}

	async start(name: string): Promise<void> {
		log("docker", "starting container: " + name);
		await fetch(this.url + "/start?name=" + name);
	}

	async stop(name: string): Promise<void> {
		log("docker", "stopping container: " + name);
		await fetch(this.url + "/stop?name=" + name);
	}

	async restart(name: string): Promise<void> {
		log("docker", "restarting container: " + name);
		await fetch(this.url + "/restart?name=" + name);
	}

	async remove(name: string): Promise<void> {
		log("docker", "removing container: " + name);
		await fetch(this.url + "/remove?name=" + name);
	}
}

export var docker: DockerApi;

export function init_docker_api(url: string) {
	log("docker", "Initializing docker api...");
	docker = new DockerApi(url);
}