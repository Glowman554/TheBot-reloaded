import { CommandEventInterface } from "./command.ts";
import { to_server, from_server } from "../protocol.ts";
import { log } from "../logger.ts";


export class CommandEventImpl implements CommandEventInterface {
	websocket: WebSocket;

	message: string;
	command: string;

	user: string;
	chat_id: string;

	files: string[]|undefined;

	mentions: string[]|undefined;
	quote_text: string|undefined;

	args: string[];
	
	pkg: to_server.on_message_pkg;

	constructor(websocket: WebSocket, pkg: to_server.on_message_pkg) {
		this.websocket = websocket;
		this.message = pkg.message;
		this.command = pkg.message.split(" ")[0];
		this.user = pkg.user_id;
		this.chat_id = pkg.chat_id;

		this.files = undefined; // TODO implement this
		this.mentions = pkg.mentions;
		this.quote_text = pkg.quote_text;

		this.args = pkg.message.split(" ");

		this.pkg = pkg;
	}

	send_message(message: string): Promise<void> {
		return new Promise((resolve, reject) => {
			from_server.send_message(message, this.pkg.id, this.websocket).then(() => {
				resolve();
			});
		});
	}

	send_picture_message(file: string): Promise<void> {
		return new Promise((resolve, reject) => { 
			from_server.send_message_media(from_server.message_send_media_pkg_type.picture, file, this.pkg.id, this.websocket).then(() => {
				resolve();
			});
		})
	}

	send_video_message(file: string): Promise<void> {
		return new Promise((resolve, reject) => {
			from_server.send_message_media(from_server.message_send_media_pkg_type.video, file, this.pkg.id, this.websocket).then(() => {
				resolve();
			});
		});
	}

	send_sticker_message(file: string): Promise<void> {
		return new Promise((resolve, reject) => {
			from_server.send_message_media(from_server.message_send_media_pkg_type.sticker, file, this.pkg.id, this.websocket).then(() => {
				resolve();
			});
		});
	}

	send_audio_message(file: string): Promise<void> {
		return new Promise((resolve, reject) => {
			from_server.send_message_media(from_server.message_send_media_pkg_type.audio, file, this.pkg.id, this.websocket).then(() => {
				resolve();
			});
		});
	}

	set_bot_status(status: string): Promise<void> {
		return new Promise((resolve, reject) => {
			from_server.send_set_bot_status(status, this.websocket).then(() => {
				resolve();
			});
		});
	}
}