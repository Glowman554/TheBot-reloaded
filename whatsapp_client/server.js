import { handle_message_ack, handle_message_send, handle_internal_error, handle_key_auth_response } from "./index.js";
import { log } from "./log.js";
import  websocket from "websocket";
var socket;
var connection;
export function connect_server(url) {
	log("Connecting to " + url);
	socket = new websocket.client();

	socket.on('connectFailed', function(error) {
		socket = null;
		connection = null;
		log('Connect Error: ' + error.toString());
		setTimeout(() => connect_server(url), 5000);
	});
	
	socket.on('connect', function(con) {
		connection = con;
		connection.send = function(data) {
			console.log("-> " + data);
			connection.sendUTF(data);
		}
		connection.send("auth:" + process.argv[2]);

		log('WebSocket Client Connected');
		connection.on('error', function(error) {
			socket = null;
			connection = null;
			log("Connection Error: " + error.toString());
			setTimeout(() => connect_server(url), 5000);
		});
		connection.on('close', function() {
			socket = null;
			connection = null;
			log('echo-protocol Connection Closed');
			setTimeout(() => connect_server(url), 5000);
		});
		connection.on('message', function(message) {
			
			if (message.type === 'utf8') {
				console.log("<- " + message.utf8Data);

				connection.onmessage({
					data: message.utf8Data
				});
			}
		});

		connection.onmessage = function(message) {
			handle_from_server(JSON.parse(message.data));
		}
	});

	socket.connect(url);
}

var pkg_queue = [];

export function send_to_server(pkg) {
	if (connection) {
		if (pkg_queue.length > 0) {
			while (pkg_queue.length > 0) {
				connection.send(JSON.stringify(pkg_queue.shift()));
			}
		}

		connection.send(JSON.stringify(pkg));
	} else {
		console.log("No connection to server queuing pkg. Queue length: " + pkg_queue.length);
		pkg_queue.push(pkg);
	}
}


export function config_get(section, key) {
	return new Promise((resolve, reject) => {
		var old_wsonmessage = connection.onmessage;
		connection.onmessage = async (event) => {
			var pkg = JSON.parse(event.data);
			if (pkg.id == 4) {
				var cr_pkg = pkg.data;
				if (cr_pkg.section == section && cr_pkg.key == key) {
					connection.onmessage = old_wsonmessage;
					resolve(cr_pkg.config);
				} else {
					connection.onmessage = old_wsonmessage;
					reject(new Error("Invalid config response"));
				}
			} else {
				connection.onmessage = old_wsonmessage;
				reject(new Error("Invalid config response"));
			}
		}

		send_to_server({
			id: 3,
			data: {
				section: section,
				key: key
			}
		});
	});
}

var handlers = [];
handlers[1] = handle_message_send;
handlers[2] = handle_message_ack;
handlers[3] = handle_internal_error;
handlers[5] = handle_key_auth_response;

export function handle_from_server(pkg) {
	if (handlers[pkg.id]) {
		if (typeof handlers[pkg.id] === "function") {
			handlers[pkg.id](pkg.data);
		} else {
			log("No handler for " + pkg.id);
		}
	} else {
		log("No handler for " + pkg.id);
	}
}