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
		// log("event", "Handling event " + name);

		var handler = this.event_handlers.find((h) => h.name == name);
		if (handler) {
			await (handler as EventHandler<T>).executor(ctx);
		}
	}
}

export var event = new EventManager();
