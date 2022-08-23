import wwebjs from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

import { client, log, protocol, set_client_name, set_remote_log } from "bot_server_client";

import { readFileSync, writeFileSync } from "fs";
import { extension } from "mime-types";

import { InternalCommands } from "bot_internal_commands";

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

client.set_logger(log);
client.add_handler(protocol.from_server.message_send, handle_message_send);
client.add_handler(protocol.from_server.message_send_ack, handle_message_ack);
client.add_handler(protocol.from_server.key_auth_response, handle_key_auth_response);
client.add_handler(protocol.from_server.internal_error, handle_internal_error);
client.add_handler(protocol.from_server.message_send_media, handle_message_send_media);
client.add_handler(protocol.from_server.set_bot_status, handle_set_bot_status);

var connection_info = JSON.parse(readFileSync(process.argv[2]).toString());

set_remote_log(connection_info.remote_log);
set_client_name("whatsapp");

client.connect_server(connection_info.url, connection_info.key);

/**
 * @type {InternalCommands} internal_commands
 */
var internal_commands;

/**
 * @type {wwebjs.Client} wa_client
 */
var wa_client = null;
async function client_init() {
	wa_client = new wwebjs.Client({
		authStrategy: new wwebjs.LocalAuth(),
		puppeteer: {
			args: await protocol.helper.config_get("whatsapp", "puppeteer_args", client.connection),
		},
	});

	wa_client.on("qr", (qr) => {
		// Generate and scan this code with your phone
		log("QR code: " + qr);
		qrcode.generate(qr, { small: true }, (qr) => {
			log(qr);
		});
	});

	wa_client.on("ready", async () => {
		log("Client is ready!");
	});

	wa_client.on("message", async (msg) => {
		if (msg.fromMe) {
			return;
		}

		var ir = await internal_commands.handle(msg.author ? msg.author : msg.from, msg.body);
		if (ir) {
			wa_client.sendMessage(msg.from, ir);
			return;
		}

		var files = [];

		if (client.connection) {
			if (msg.hasQuotedMsg) {
				var quote = await msg.getQuotedMessage();
				if (quote.hasMedia) {
					var media = await quote.downloadMedia();
					var data = Buffer.from(media.data, "base64");

					var file = await protocol.helper.tmp_file_get(media.filename ? media.filename.split(".")[0] : extension(media.mimetype), 1000 * 60 * 5, client.connection);

					log("writing " + file + " with " + data.length + " bytes");

					writeFileSync(file, data);
					files.push(file);
				}
			}

			if (msg.hasMedia) {
				var media = await msg.downloadMedia();
				var data = Buffer.from(media.data, "base64");

				var file = await protocol.helper.tmp_file_get(media.filename ? media.filename.split(".")[0] : extension(media.mimetype), 1000 * 60 * 5, client.connection);

				log("writing " + file + " with " + data.length + " bytes");

				writeFileSync(file, data);
				files.push(file);
			}
		}

		log("Files:\n" + JSON.stringify(files, null, "\t"));

		log("Message from " + msg.from + ": " + msg.body);

		protocol.to_server.send_on_message(msg.body, msg.author || msg.from, msg.from, msg.mentionedIds, msg.hasQuotedMsg ? (await msg.getQuotedMessage()).body : undefined, files, message_register(msg));
	});

	wa_client.initialize();
}

export async function handle_message_send(pkg) {
	pkg.message = pkg.message.replaceAll("<code>", "```").replaceAll("<bg_code>", "```").replaceAll("<bold>", "*").replaceAll("<italic>", "_");
	log("Answering to message " + pkg.id + " with " + pkg.message);
	var mentions = [];

	for (let i in pkg.message.split("@")) {
		if (parseInt(i) == 0) {
			continue; // first index isn't mention
		}

		var mention = pkg.message.split("@")[i].split(" ")[0];

		if (isNaN(parseInt(mention)) || mention == "") {
			continue;
		}

		try {
			var contact = await wa_client.getContactById(mention + "@c.us");

			mentions.push(contact);
		} catch (e) {
			log(`Error getting contact ${mention}`);
		}
	}

	wa_client.sendMessage(message_get(pkg.id).from, pkg.message, {
		mentions: mentions,
	});
}

export function handle_message_ack(pkg) {
	log("acknowledging message " + pkg.id);
	var msg = message_get(pkg.id);
	wa_client.sendSeen(msg.from);
}

export function handle_internal_error(pkg) {
	if (pkg.cause.id == 2) {
		wa_client.sendMessage(message_get(pkg.cause.data.id).from, "Internal error: " + pkg.message);
	} else {
		log("Error not caused by a on_message pkg. Can't send informative message.");
	}
}

export async function handle_key_auth_response(pkg) {
	if (!pkg.success) {
		throw new Error("Auth failed!");
	} else {
		log("Auth success!");
		if (!wa_client) {
			await client_init();
		}

		internal_commands = new InternalCommands(await protocol.helper.config_get("whatsapp", "owner", client.connection), "i!");

		internal_commands.add({
			name: "exit",
			executor: async (input) => {
				if (input.length != 0) {
					return "takes no arguments!";
				}

				process.exit(0);
			},
		});

		internal_commands.add({
			name: "name",
			executor: async (input) => {
				if (input.length < 0) {
					return "no name provided!";
				}

				wa_client.setDisplayName(input.join(" "));
				return "setting name to " + input.join(" ");
			},
		});
	}
}

export function handle_message_send_media(pkg) {
	log("Answering to message " + pkg.id + " with " + pkg.path);

	wa_client.sendMessage(message_get(pkg.id).from, wwebjs.MessageMedia.fromFilePath(pkg.path), {
		sendMediaAsSticker: pkg.type == protocol.from_server.message_send_media_pkg_type.sticker,
	});
}

export function handle_set_bot_status(pkg) {
	log("Setting bot status to " + pkg.status);
	wa_client.setStatus(pkg.status);
}

process.on("uncaughtException", async (error) => {
	log(String(error));
});