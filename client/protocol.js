import { send_to_server } from "./client.js";

export var from_server = {
	message_send: 1,
	message_send_ack: 2,
	internal_error: 3,
	config_response: 4,
	key_auth_response: 5,
	message_send_media: 6,
	set_bot_status: 7,

	message_send_media_pkg_type: {
		picture: 1,
		video: 2,
		sticker: 3,
		audio: 4
	}
};

export var to_server = {
	log: 1,
	on_message: 2,
	config_request: 3,

	send_log: async (msg, client_name) => {
		var pkg = {
			message: msg,
			client_name: client_name
		};
	
		send_to_server({
			id: to_server.log,
			data: pkg
		});
	},

	send_on_message: async (msg, user_id, chat_id, mentions, quote_text, id) => {
		var pkg = {
			message: msg,
			user_id: user_id,
			chat_id: chat_id,
			mentions: mentions,
			quote_text: quote_text,
			id: id
		};
	
		send_to_server({
			id: to_server.on_message,
			data: pkg
		});
	},

	send_config_request: async (section, key) => {
		var pkg = {
			section: section,
			key: key
		};
	
		send_to_server({
			id: to_server.config_request,
			data: pkg
		});
	}

};


export var helper = {
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
			}

			to_server.send_config_request(section, key, socket);
		});
	}
}