// deno-lint-ignore-file no-explicit-any
import { log } from "../logger.ts";
import { EventHandler } from "./event_handler.ts";

export class EventManager {
	event_handlers: EventHandler<any>[];

	constructor() {
		this.event_handlers = [];
	}

	add(event_handler: EventHandler<any>) {
		log("event", "Adding event handler with name " + event_handler.name);
		this.event_handlers.push(event_handler);
	}

	async handle<T>(name: string, ctx: T) {
		log("event", "Handling event " + name);

		const handlers = this.event_handlers.filter((h) => h.name == name);
		for (const handler of handlers) {
			await (handler as EventHandler<T>).executor(ctx);
		}
	}
}

export const event = new EventManager();
