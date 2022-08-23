import { client, log, protocol, set_client_name, set_remote_log } from "bot_server_client";

import { ActivityType, Client } from "discord.js";

import { readFileSync } from "fs";

import { InternalCommands } from "bot_internal_commands";

import download from "download";

var messages = {};
/**
 * @type {InternalCommands} internal_commands
 */
var internal_commands;

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

client.set_logger(log);
client.add_handler(protocol.from_server.message_send, handle_message_send);
client.add_handler(protocol.from_server.key_auth_response, handle_key_auth_response);
client.add_handler(protocol.from_server.internal_error, handle_internal_error);
client.add_handler(protocol.from_server.message_send_media, handle_message_send_media);
client.add_handler(protocol.from_server.set_bot_status, handle_set_bot_status);

var connection_info = JSON.parse(readFileSync(process.argv[2]).toString());
set_remote_log(connection_info.remote_log);
set_client_name("discord");
client.connect_server(connection_info.url, connection_info.key);

var dc_client = new Client({
	intents: [0b11111111111111111],
});
var client_logged_in = false;

dc_client.on("messageCreate", async (msg) => {
	if (msg.author.bot) {
		return;
	}

	log("Message from " + msg.author.username + ": " + msg.content);

	var ir = await internal_commands.handle(msg.author.id, msg.content);
	if (ir) {
		msg.channel.send(ir);
		return;
	}

	var files = [];
	if (client.connection) {
		for (var i of msg.attachments.values()) {
			var tmp_file = await protocol.helper.tmp_file_get(i.url.split(".").pop(), 1000 * 60 * 5, client.connection);
			log("Downloading " + i.url + " to " + tmp_file);
			await download(i.url, tmp_file.split("/").slice(0, -1).join("/"), {
				filename: tmp_file.split("/").pop(),
			});
			files.push(tmp_file);
		}

		if (msg.reference) {
			var attachments = (await msg.channel.messages.fetch(msg.reference.messageId)).attachments;
			for (var i of attachments.values()) {
				var tmp_file = await protocol.helper.tmp_file_get(i.url.split(".").pop(), 1000 * 60 * 5, client.connection);
				log("Downloading " + i.url + " to " + tmp_file);
				await download(i.url, tmp_file.split("/").slice(0, -1).join("/"), {
					filename: tmp_file.split("/").pop(),
				});
				files.push(tmp_file);
			}
		}
	}

	log("Files:\n" + JSON.stringify(files, null, "\t"));

	var quote_text = undefined;
	if (msg.reference) {
		quote_text = (await msg.channel.messages.fetch(msg.reference.messageId)).content;
	}

	var id = message_register(msg);
	protocol.to_server.send_on_message(msg.content, msg.author.id, msg.channelId, [], quote_text, files, id);
});

dc_client.on("ready", () => {
	log("ready");
});

export async function handle_key_auth_response(pkg) {
	if (!pkg.success) {
		throw new Error("Auth failed!");
	} else {
		log("Auth success!");
		if (!client_logged_in) {
			dc_client.login(String(await protocol.helper.config_get("discord", "token", client.connection)));
			client_logged_in = true;
		}

		internal_commands = new InternalCommands(await protocol.helper.config_get("discord", "owner", client.connection), "i!");

		internal_commands.add({
			name: "exit",
			executor: async (input) => {
				if (input.length != 0) {
					return "takes no arguments!";
				}

				process.exit(0);
			},
		});
	}
}

export async function handle_message_send(pkg) {
	log("Answering to message " + pkg.id + " with " + pkg.message);

	var msg = message_get(pkg.id);
	if (!msg) {
		log("message " + pkg.id + " not found");
		return;
	}
	msg.channel.send(pkg.message);
}

export async function handle_message_send_media(pkg) {
	log("Answering to message " + pkg.id + " with " + pkg.path);

	var msg = message_get(pkg.id);
	if (!msg) {
		log("message " + pkg.id + " not found");
		return;
	}
	msg.channel.send({
		files: [pkg.path],
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
	log("Setting bot status to " + pkg.status);

	client.user.setActivity({
		type: ActivityType.Streaming,
		url: "https://twitch.tv/glowman434",
		name: pkg.status,
	});
}
