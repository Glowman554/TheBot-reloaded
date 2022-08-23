import { send_to_server } from "./client.js";
import websocket from "websocket";

export var from_server = {
	message_send: 1,
	message_send_ack: 2,
	internal_error: 3,
	config_response: 4,
	key_auth_response: 5,
	message_send_media: 6,
	set_bot_status: 7,
	tmp_file_response: 8,

	message_send_media_pkg_type: {
		picture: 1,
		video: 2,
		sticker: 3,
		audio: 4,
	},
};

export var to_server = {
	log: 1,
	on_message: 2,
	config_request: 3,
	tmp_file_request: 4,

	/**
	 * 
	 * @param {string} msg 
	 * @param {string} client_name 
	 */
	send_log: async (msg, client_name) => {
		var pkg = {
			message: msg,
			client_name: client_name,
		};

		send_to_server({
			id: to_server.log,
			data: pkg,
		});
	},

	/**
	 * 
	 * @param {string} msg 
	 * @param {string} user_id 
	 * @param {string} chat_id 
	 * @param {string[]} mentions 
	 * @param {string|undefined} quote_text 
	 * @param {string[]} files 
	 * @param {string} id 
	 */
	send_on_message: async (msg, user_id, chat_id, mentions, quote_text, files, id) => {
		var pkg = {
			message: msg,
			user_id: user_id,
			chat_id: chat_id,
			mentions: mentions,
			quote_text: quote_text,
			files: files,
			id: id,
		};

		send_to_server({
			id: to_server.on_message,
			data: pkg,
		});
	},

	/**
	 * 
	 * @param {string} section 
	 * @param {string} key 
	 */
	send_config_request: async (section, key) => {
		var pkg = {
			section: section,
			key: key,
		};

		send_to_server({
			id: to_server.config_request,
			data: pkg,
		});
	},

	/**
	 * 
	 * @param {string} ext 
	 * @param {number} ttl 
	 */
	send_tmp_file_request: async (ext, ttl) => {
		var pkg = {
			ext: ext,
			ttl: ttl,
		};

		send_to_server({
			id: to_server.tmp_file_request,
			data: pkg,
		});
	},
};

export var helper = {
	/**
	 * 
	 * @param {string} section 
	 * @param {string} key 
	 * @param {websocket.connection} socket 
	 * @returns {Promise<any>}
	 */
	config_get: (section, key, socket) => {
		return new Promise((resolve, reject) => {
			var old_wsonmessage = socket.onmessage;
			socket.onmessage = async (event) => {
				var pkg = JSON.parse(event.data);
				if (pkg.id == from_server.config_response) {
					var cr_pkg = pkg.data;
					if (cr_pkg.section == section && cr_pkg.key == key) {
						socket.onmessage = old_wsonmessage;
						resolve(cr_pkg.config);
					} else {
						socket.onmessage = old_wsonmessage;
						reject(new Error("Invalid config response"));
					}
				} else {
					old_wsonmessage(event);
				}
			};

			to_server.send_config_request(section, key);
		});
	},

	/**
	 * 
	 * @param {string} ext 
	 * @param {number} ttl 
	 * @param {websocket.connection} socket 
	 * @returns {Promise<string>}
	 */
	tmp_file_get: (ext, ttl, socket) => {
		return new Promise((resolve, reject) => {
			var old_wsonmessage = socket.onmessage;
			socket.onmessage = async (event) => {
				var pkg = JSON.parse(event.data);
				if (pkg.id == from_server.tmp_file_response) {
					var cr_pkg = pkg.data;
					if (cr_pkg.ext == ext) {
						socket.onmessage = old_wsonmessage;
						resolve(cr_pkg.path);
					} else {
						socket.onmessage = old_wsonmessage;
						reject(new Error("Invalid tmp file response"));
					}
				} else {
					old_wsonmessage(event);
				}
			};

			to_server.send_tmp_file_request(ext, ttl);
		});
	},
};
