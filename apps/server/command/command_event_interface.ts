import { CommandEventInterface } from "./command.ts";
import { from_server, to_server } from "../protocol.ts";
import { partition } from "./splitter.ts";

export class CommandEventImpl implements CommandEventInterface {
	websocket: WebSocket;

	message: string;
	command: string;

	user: string;
	chat_id: string;

	files: string[] | undefined;

	mentions: string[] | undefined;
	quote_text: string | undefined;

	args: string[];

	pkg: to_server.on_message_pkg;

	constructor(websocket: WebSocket, pkg: to_server.on_message_pkg) {
		this.websocket = websocket;
		this.message = pkg.message;
		this.command = pkg.message.split(" ")[0];
		this.user = pkg.user_id;
		this.chat_id = pkg.chat_id;

		this.files = pkg.files;
		this.mentions = pkg.mentions;
		this.quote_text = pkg.quote_text;

		this.args = pkg.message.split(" ");

		this.pkg = pkg;
	}

	send_message(message: string): Promise<void> {
		return new Promise((resolve, _reject) => {
			partition(message, 2000).forEach((m) => {
				from_server.send_message(m, this.pkg.id, this.websocket);
				resolve();
			});
		});
	}

	send_picture_message(file: string): Promise<void> {
		return new Promise((resolve, _reject) => {
			const absolute_file = Deno.realPathSync(file);
			from_server.send_message_media(from_server.message_send_media_pkg_type.picture, absolute_file, this.pkg.id, this.websocket);
			resolve();
		});
	}

	send_video_message(file: string): Promise<void> {
		return new Promise((resolve, _reject) => {
			const absolute_file = Deno.realPathSync(file);
			from_server.send_message_media(from_server.message_send_media_pkg_type.video, absolute_file, this.pkg.id, this.websocket);
			resolve();
		});
	}

	send_sticker_message(file: string): Promise<void> {
		return new Promise((resolve, _reject) => {
			const absolute_file = Deno.realPathSync(file);
			from_server.send_message_media(from_server.message_send_media_pkg_type.sticker, absolute_file, this.pkg.id, this.websocket);
			resolve();
		});
	}

	send_audio_message(file: string): Promise<void> {
		return new Promise((resolve, _reject) => {
			const absolute_file = Deno.realPathSync(file);
			from_server.send_message_media(from_server.message_send_media_pkg_type.audio, absolute_file, this.pkg.id, this.websocket);
			resolve();
		});
	}

	set_bot_status(status: string): Promise<void> {
		return new Promise((resolve, _reject) => {
			from_server.send_set_bot_status(status, this.websocket);
			resolve();
		});
	}
}
