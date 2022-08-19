import  websocket from "websocket";

export var socket = null;
export var connection = null;

var logger = (message) => {};

export function set_logger(logger_function) {
	logger = logger_function;
}

var handlers = [];
export function add_handler(id, handler) {
	handlers[id] = handler;
}

export function connect_server(url, key) {
	logger("Connecting to " + url);
	socket = new websocket.client();

	socket.on('connectFailed', function(error) {
		socket = null;
		connection = null;
		logger('Connect Error: ' + error.toString());
		setTimeout(() => connect_server(url, key), 5000);
	});
	
	socket.on('connect', function(con) {
		connection = con;
		connection.send = function(data) {
			// logger("-> " + data);
			connection.sendUTF(data);
		}
		connection.send("auth:" + key);

		logger('WebSocket Client Connected');
		connection.on('error', function(error) {
			socket = null;
			connection = null;
			logger("Connection Error: " + error.toString());
			setTimeout(() => connect_server(url, key), 5000);
		});
		connection.on('close', function() {
			socket = null;
			connection = null;
			logger('echo-protocol Connection Closed');
			setTimeout(() => connect_server(url, key), 5000);
		});
		connection.on('message', function(message) {
			
			if (message.type === 'utf8') {
				// logger("<- " + message.utf8Data);

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

function handle_from_server(pkg) {
	if (handlers[pkg.id]) {
		if (typeof handlers[pkg.id] === "function") {
			handlers[pkg.id](pkg.data);
		} else {
			logger("No handler for " + pkg.id);
		}
	} else {
		logger("No handler for " + pkg.id);
	}
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