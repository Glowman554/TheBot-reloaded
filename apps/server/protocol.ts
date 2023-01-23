// deno-lint-ignore-file no-namespace
export namespace from_server {
	export enum pkg_ids {
		message_send = 1,
		message_send_ack = 2,
		internal_error_pkg = 3,
		config_response = 4,
		key_auth_response = 5,
		message_send_media = 6,
		set_bot_status = 7,
		tmp_file_response = 8,
	}

	export interface message_send_pkg {
		message: string;
		id: number;
	}

	export interface message_send_ack_pkg {
		id: number;
	}

	export interface internal_error_pkg {
		message: string;
		cause: to_server.pkg;
	}

	export interface config_response_pkg {
		// deno-lint-ignore ban-types
		config: object | string;
		section: string;
		key: string;
	}

	export interface key_auth_response_pkg {
		success: boolean;
	}

	export enum message_send_media_pkg_type {
		picture = 1,
		video = 2,
		sticker = 3,
		audio = 4,
	}

	export interface message_send_media_pkg {
		type: message_send_media_pkg_type;
		path: string;
		id: number;
	}

	export interface set_bot_status_pkg {
		status: string;
	}

	export interface tmp_file_response_pkg {
		path: string;
		ext: string;
	}

	export interface pkg {
		id: pkg_ids;
		// deno-lint-ignore no-explicit-any
		data: any;
	}

	export function send_message(msg: string, id: number, socket: WebSocket) {
		const pkg: from_server.message_send_pkg = {
			message: msg,
			id: id,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.message_send,
data: pkg,
}));
	}

	export function send_message_ack(id: number, socket: WebSocket) {
		const pkg: from_server.message_send_ack_pkg = {
			id: id,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.message_send_ack,
data: pkg,
}));
	}

	export function send_internal_error(msg: string, cause: to_server.pkg, socket: WebSocket) {
		const pkg: from_server.internal_error_pkg = {
			message: msg,
			cause: cause,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.internal_error_pkg,
data: pkg,
}));
	}

	// deno-lint-ignore ban-types
	export function send_config_response(config: object | string, section: string, key: string, socket: WebSocket) {
		const pkg: from_server.config_response_pkg = {
			config: config,
			section: section,
			key: key,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.config_response,
data: pkg,
}));
	}

	export function send_key_auth_response(success: boolean, socket: WebSocket) {
		const pkg: from_server.key_auth_response_pkg = {
			success: success,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.key_auth_response,
data: pkg,
}));
	}

	export function send_message_media(type: message_send_media_pkg_type, path: string, id: number, socket: WebSocket) {
		const pkg: from_server.message_send_media_pkg = {
			type: type,
			path: path,
			id: id,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.message_send_media,
data: pkg,
}));
	}

	export function send_set_bot_status(status: string, socket: WebSocket) {
		const pkg: from_server.set_bot_status_pkg = {
			status: status,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.set_bot_status,
data: pkg,
}));
	}

	export function send_tmp_file_response(path: string, ext: string, socket: WebSocket) {
		const pkg: from_server.tmp_file_response_pkg = {
			path: path,
			ext: ext,
		};

		socket.send(JSON.stringify({
id: from_server.pkg_ids.tmp_file_response,
data: pkg,
}));
	}
}

export namespace to_server {
	export enum pkg_ids {
		log = 1,
		on_message = 2,
		config_request = 3,
		tmp_file_request = 4,
	}

	export interface on_message_pkg {
		message: string;
		user_id: string;
		chat_id: string;

		mentions: string[] | undefined;
		quote_text: string | undefined;

		files: string[] | undefined;

		id: number;
	}

	export interface log_pkg {
		message: string;
		client_name: string;
	}

	export interface config_request_pkg {
		section: string;
		key: string;
	}

	export interface tmp_file_request_pkg {
		ext: string;
		ttl: number;
	}

	export interface pkg {
		id: pkg_ids;
		// deno-lint-ignore no-explicit-any
		data: any;
	}

	export function send_log(msg: string, client_name: string, socket: WebSocket) {
		const pkg: to_server.log_pkg = {
			message: msg,
			client_name: client_name,
		};

		socket.send(JSON.stringify({
id: to_server.pkg_ids.log,
data: pkg,
}));
	}

	export function send_on_message(msg: string, user_id: string, chat_id: string, mentions: string[] | undefined, quote_text: string | undefined, files: string[] | undefined, id: number, socket: WebSocket) {
		const pkg: to_server.on_message_pkg = {
			message: msg,
			user_id: user_id,
			chat_id: chat_id,
			mentions: mentions,
			quote_text: quote_text,
			files: files,
			id: id,
		};

		socket.send(JSON.stringify({
id: to_server.pkg_ids.on_message,
data: pkg,
}));
	}

	export function send_config_request(section: string, key: string, socket: WebSocket) {
		const pkg: to_server.config_request_pkg = {
			section: section,
			key: key,
		};

		socket.send(JSON.stringify({
id: to_server.pkg_ids.config_request,
data: pkg,
}));
	}

	export function send_tmp_file_request(ext: string, ttl: number, socket: WebSocket) {
		const pkg: to_server.tmp_file_request_pkg = {
			ext: ext,
			ttl: ttl,
		};

		socket.send(JSON.stringify({
id: to_server.pkg_ids.tmp_file_request,
data: pkg,
}));
	}

	// deno-lint-ignore ban-types
	export function config_get(section: string, key: string, socket: WebSocket): Promise<object | string> {
		return new Promise((resolve, reject) => {
			const old_wsonmessage = socket.onmessage;
			socket.onmessage = (event) => {
				const pkg = JSON.parse(event.data);
				if (pkg.id == from_server.pkg_ids.config_response) {
					const cr_pkg = pkg.data as from_server.config_response_pkg;
					if (cr_pkg.section == section && cr_pkg.key == key) {
						socket.onmessage = old_wsonmessage;
						resolve(cr_pkg.config);
					} else {
						socket.onmessage = old_wsonmessage;
						reject(new Error("Invalid config response"));
					}
				} else {
					socket.onmessage = old_wsonmessage;
					reject(new Error("Invalid config response"));
				}
			};

			send_config_request(section, key, socket);
		});
	}
}
