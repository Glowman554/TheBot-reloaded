// deno-lint-ignore-file require-await no-empty
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";
import { download } from "https://deno.land/x/download/mod.ts";
import { get_temp_file } from "../../utils/tmp.ts";
import { get_file_extension } from "../../utils/file.ts";

export default class Sticker implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("sticker", "Convert a image / url to a sticker!", help_text("Use '<prefix>sticker [url?]' to convert a url / image to a sticker!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
                    if (event.interface.args.length == 1) {
                        //check if url
                        if (event.interface.args[0].startsWith("http")) {

                            const tmp_file = get_temp_file(get_file_extension(event.interface.args[0]));
                            await download(event.interface.args[0], {
                                file: tmp_file,
                                dir: "/"
                            });

                            event.interface.send_sticker_message(tmp_file);
                
                            return {
                                is_response: false,
                                response: ""
                            };
                        }
                    }
                
                    // check for media stuff
                    if (!event.interface.files) {
                        return fail;
                    }
                   
                    for (const i of event.interface.files) {
                        event.interface.send_sticker_message(i);
                    }

                    return {
                        is_response: false,
                        response: ""
                    };
				},
			} as CommandExecutor, undefined),
		);
	}
}
