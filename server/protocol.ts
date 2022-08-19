export namespace from_server {
	export enum pkg_ids {
		message_send = 1,
		message_send_ack = 2,
		internal_error_pkg = 3
	};

	export interface message_send_pkg {
		message: string;
		id: number;
	};

	export interface message_send_ack_pkg {
		id: number;
	};

	export interface internal_error_pkg {
		message: string;
		cause: to_server.pkg;
	};

	export interface pkg {
		id: pkg_ids;
		data: any;
	}

	export async function send_message(msg: string, id:number, socket: WebSocket) {
		var pkg: from_server.message_send_pkg = {
			message: msg,
			id: id
		};
	
		await socket.send(JSON.stringify({
			id: from_server.pkg_ids.message_send,
			data: pkg
		}));
	}

	export async function send_message_ack(id: number, socket: WebSocket) {
		var pkg: from_server.message_send_ack_pkg = {
			id: id
		};

		await socket.send(JSON.stringify({
			id: from_server.pkg_ids.message_send_ack,
			data: pkg
		}));
	}

	export async function send_internal_error(msg: string, cause: to_server.pkg, socket: WebSocket) {
		var pkg: from_server.internal_error_pkg = {
			message: msg,
			cause: cause
		};
	
		await socket.send(JSON.stringify({
			id: from_server.pkg_ids.internal_error_pkg,
			data: pkg
		}));
	}
}

export namespace to_server {
	export enum pkg_ids {
		log = 1,
		on_message = 2
	};

	export interface on_message_pkg {
		message: string;
		user_id: string;
		chat_id: string;

		mentions: string[]|undefined;
		quote_text: string|undefined;

		id: number;
	}

	export interface log_pkg {
		message: string;
		client_name: string;
	};

	export interface pkg {
		id: pkg_ids;
		data: any;
	}

	export async function send_log(msg: string, client_name: string, socket: WebSocket) {
		var pkg: to_server.log_pkg = {
			message: msg,
			client_name: client_name
		};
	
		await socket.send(JSON.stringify({
			id: to_server.pkg_ids.log,
			data: pkg
		}));
	}

	export async function send_on_message(msg: string, user_id: string, chat_id: string, mentions: string[]|undefined, quote_text: string|undefined, id: number, socket: WebSocket) {
		var pkg: to_server.on_message_pkg = {
			message: msg,
			user_id: user_id,
			chat_id: chat_id,
			mentions: mentions,
			quote_text: quote_text,
			id: id
		};
	
		await socket.send(JSON.stringify({
			id: to_server.pkg_ids.on_message,
			data: pkg
		}));
	}
}