import { CommandEvent } from "../command/command.ts";
import { config } from "../config/config.ts";
import { event } from "../event/event.ts";
import { EventHandler } from "../event/event_handler.ts";
import { loadable } from "../loadable.ts";

export function init_hello() {
    var hello_on = config.get("hello_on") as string[];

    var handler: EventHandler<CommandEvent> = {
        name: "on_message_ce",
        async executor(ce: CommandEvent) {
            if (hello_on.includes(ce.interface.message.trim())) {
                await ce.interface.send_message(config.get("hello") as string);
            }
        }
    };

    event.add(handler);
}

export default class Hello implements loadable {
    load(): void {
        init_hello();
    }
}