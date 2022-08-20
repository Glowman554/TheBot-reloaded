import { log } from './log.js';
import { from_server, to_server, helper } from "bot_server_client/protocol.js";
import { connect_server, add_handler, connection, set_logger} from "bot_server_client/client.js";

import { Client, ActivityType } from 'discord.js';

import { readFileSync } from "fs";

var messages = {};

function message_cleanup() {
	// delete messages older than 5 minutes
	var now = new Date();
	var cutoff = new Date(now.getTime() - 300000);
	for (var id in messages) {
		if (messages[id].time_added < cutoff) {
			log("deleting message " + id + " because it's older than 5 minutes");
			delete messages[id];
		}
	}
}

function message_register(msg) {
	message_cleanup();
	var id = Math.floor(Math.random() * 1000000);
	messages[id] = msg;
	messages[id].time_added = new Date();
	return id;
}

function message_get(id) {
	message_cleanup();
	return messages[id];
}

function message_delete(id) {
	message_cleanup();
	delete messages[id];
}

set_logger(log);
add_handler(from_server.message_send, handle_message_send);
add_handler(from_server.key_auth_response, handle_key_auth_response);
add_handler(from_server.internal_error, handle_internal_error);
add_handler(from_server.message_send_media, handle_message_send_media);
add_handler(from_server.set_bot_status, handle_set_bot_status);

var connection_info = JSON.parse(readFileSync(process.argv[2]).toString());

connect_server(connection_info.url, connection_info.key);

var client = new Client({
	intents: [ 0b11111111111111111 ]
});

client.on('messageCreate', msg => {
	if (msg.author.bot) {
		return;
	}
	var id = message_register(msg);
	to_server.send_on_message(msg.content, msg.author.id, msg.channelId, [], undefined, id);
});

client.on('ready', () => {
	log("ready");
});

export async function handle_key_auth_response(pkg) {
	if (!pkg.success) {
		throw new Error("Auth failed!");
	} else {
		log("Auth success!");
		client.login(String(await helper.config_get("discord", "token", connection)));
	}
}

export async function handle_message_send(pkg) {
	var msg = message_get(pkg.id);
	if (!msg) {
		log("message " + pkg.id + " not found");
		return;
	}
	msg.channel.send(pkg.message);
}

export async function handle_message_send_media(pkg) {
	var msg = message_get(pkg.id);
	if (!msg) {
		log("message " + pkg.id + " not found");
		return;
	}
	msg.channel.send({
		files: [ pkg.path ]
	});
}

export async function handle_internal_error(pkg) {
	if (pkg.cause.id == 2) {
		message_get(pkg.cause.data.id).channel.send("Internal error: " + pkg.message);
	} else {
		log("Error not caused by a on_message pkg. Can't send informative message.");
	}
}

export async function handle_set_bot_status(pkg) {
	client.user.setActivity({
		type: ActivityType.Streaming,
		url: "https://twitch.tv/glowman434",
		name: pkg.status
	});
}