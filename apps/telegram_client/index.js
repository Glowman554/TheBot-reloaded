import { client, log, protocol, set_client_name, set_remote_log } from "bot_server_client";
import { readFileSync } from "fs";
import { InternalCommands } from "bot_internal_commands";
import { Telegraf } from "telegraf";
import fetch from "node-fetch";
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
client.add_handler(protocol.from_server.key_auth_response, handle_key_auth_response);
client.add_handler(protocol.from_server.message_send, handle_message_send);
client.add_handler(protocol.from_server.message_send_media, handle_message_send_media);
client.add_handler(protocol.from_server.internal_error, handle_internal_error);

var connection_info = JSON.parse(readFileSync(process.argv[2]).toString());
set_remote_log(connection_info.remote_log);
set_client_name("telegram");
client.connect_server(connection_info.url, connection_info.key);

var tg_client = undefined;
var token;
var client_logged_in = false;

async function telegram_download_file(id) {
	var data = await (await fetch("https://api.telegram.org/bot" + token + "/getFile?file_id=" + id)).json();
	let url = `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
	var tmp_file = await protocol.helper.tmp_file_get(url.split(".").pop(), 1000 * 60 * 5, client.connection);
	log("Downloading " + url + " to " + tmp_file);
	await download(url, tmp_file.split("/").slice(0, -1).join("/"), {
		filename: tmp_file.split("/").pop(),
	});
	return tmp_file;
}

async function telegram_download_files(ctx) {
	var files = [];
	for (let i in ctx.message.photo) {
		files.push(await telegram_download_file(ctx.message.photo[i].file_id));
	}

	if (ctx.message.document) {
		files.push(await telegram_download_file(ctx.message.document.file_id));
	}

	if (ctx.message.reply_to_message) {
		for (let i in ctx.message.reply_to_message.photo) {
			files.push(await telegram_download_file(ctx.message.reply_to_message.photo[i].file_id));
		}

		if (ctx.message.reply_to_message.document) {
			files.push(await telegram_download_file(ctx.message.reply_to_message.document.file_id));
		}
	}

	return files;
}

async function telegram_message_handler(ctx) {
	let message = ctx.message.text || ctx.message.caption || "";
	log("Message from " + ctx.from.id + ": " + message);
	if (message) {
		var ir = await internal_commands.handle(ctx.from.id, message);
		if (ir) {
			ctx.reply(ir);
			return;
		}
	}

	var mentions = [];
	for (let i in ctx.message.entities) {
		if (ctx.message.entities[i].type == "mention") {
			var substr = message.substring(ctx.message.entities[i].offset, ctx.message.entities[i].offset + ctx.message.entities[i].length);
			mentions.push(substr);
		}
	}

	var files = await telegram_download_files(ctx);

	let id = message_register(ctx);
	protocol.to_server.send_on_message(message, ctx.message.from.id, ctx.message.chat.id, mentions, ctx.message.reply_to_message ? ctx.message.reply_to_message.text : undefined, files, id);
}

export async function handle_key_auth_response(pkg) {
	if (!pkg.success) {
		throw new Error("Auth failed!");
	} else {
		log("Auth success!");
		if (!client_logged_in) {
			token = await protocol.helper.config_get("telegram", "token", client.connection);
			tg_client = new Telegraf(token);
			tg_client.on("text", telegram_message_handler);
			tg_client.on("photo", telegram_message_handler);
			tg_client.on("document", telegram_message_handler);
			tg_client.launch();
			log("ready");

			client_logged_in = true;
		}

		internal_commands = new InternalCommands(await protocol.helper.config_get("telegram", "owner", client.connection), "i!");

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
	let escapees = ["_", "*", "[", "]", "(", ")", "~", "`", "#", "+", "-", "=", "|", "{", "}", ".", "!", "<", ">"];
	escapees.forEach((e) => pkg.message = pkg.message.replaceAll(e, "\\" + e));

	pkg.message = pkg.message.replaceAll("\\<code\\>", "`").replaceAll("\\<bg\\_code\\>", "```\n").replaceAll("\\<bold\\>", "*").replaceAll("\\<italic\\>", "_");
	log("Answering to message " + pkg.id + " with " + pkg.message);

	var msg = message_get(pkg.id);
	if (!msg) {
		log("message " + pkg.id + " not found");
		return;
	}
	msg.replyWithMarkdownV2(pkg.message);
}

export async function handle_message_send_media(pkg) {
	log("Answering to message " + pkg.id + " with " + pkg.path);

	var msg = message_get(pkg.id);
	if (!msg) {
		log("message " + pkg.id + " not found");
		return;
	}
	// msg.reply(JSON.stringify(pkg, undefined, "\t"));
	switch (pkg.type) {
		case protocol.from_server.message_send_media_pkg_type.audio:
			msg.replyWithAudio({ source: pkg.path });
			break;
		case protocol.from_server.message_send_media_pkg_type.picture:
			msg.replyWithPhoto({ source: pkg.path });
			break;
		case protocol.from_server.message_send_media_pkg_type.sticker:
			msg.replyWithSticker({ source: pkg.path });
			break;
		case protocol.from_server.message_send_media_pkg_type.video:
			msg.replyWithVideo({ source: pkg.path });
			break;
	}
}

export async function handle_internal_error(pkg) {
	if (pkg.cause.id == 2) {
		message_get(pkg.cause.data.id).reply("Internal error: " + pkg.message);
	} else {
		log("Error not caused by a on_message pkg. Can't send informative message.");
	}
}

process.on("uncaughtException", async (error) => {
	log(String(error));
});
