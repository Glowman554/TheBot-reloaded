import { handle_message_ack, handle_message_send, handle_internal_error } from "./index.js";
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
				handle_from_server(JSON.parse(message.utf8Data));
			}
		});
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

var handlers = [];
handlers[1] = handle_message_send;
handlers[2] = handle_message_ack;
handlers[3] = handle_internal_error;

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