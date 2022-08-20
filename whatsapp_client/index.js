import wwebjs from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

import { log } from './log.js';
import { to_server, from_server, helper } from 'bot_server_client/protocol.js';
import { connect_server, add_handler, set_logger, connection } from 'bot_server_client/client.js';

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
add_handler(from_server.message_send_ack, handle_message_ack);
add_handler(from_server.key_auth_response, handle_key_auth_response);
add_handler(from_server.internal_error, handle_internal_error);
add_handler(from_server.message_send_media, handle_message_send_media);
add_handler(from_server.set_bot_status, handle_set_bot_status);

var connection_info = JSON.parse(readFileSync(process.argv[2]).toString());

connect_server(connection_info.url, connection_info.key);

var client;
async function client_init() {
	client = new wwebjs.Client({
		authStrategy: new wwebjs.LocalAuth(),
		puppeteer: {
			args: await helper.config_get("whatsapp", "puppeteer_args", connection)
		}
	});

	client.on('qr', (qr) => {
		// Generate and scan this code with your phone
		log('QR code: ' + qr);
		qrcode.generate(qr, { small: true }, (qr) => {
			log(qr);
		});
	});

	client.on('ready', async () => {
		log('Client is ready!');
	});

	client.on('message', async msg => {
		if (msg.fromMe) {
			return;
		}

		log("Message from " + msg.from + ": " + msg.body);

		to_server.send_on_message(msg.body, msg.author || msg.from, msg.mentionedIds, msg.from, msg.hasQuotedMsg ? (await msg.getQuotedMessage()).body : undefined, message_register(msg));
	});

	client.initialize();
}


export async function handle_message_send(pkg) {
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
			var contact = await client.getContactById(mention + "@c.us");
	
			mentions.push(contact);
		} catch (e) {
			log(`Error getting contact ${mention}`);
		}	
	}

	client.sendMessage(message_get(pkg.id).from, pkg.message, {
		mentions: mentions
	});
}

export function handle_message_ack(pkg) {
	log("acknowledging message " + pkg.id);
	var msg = message_get(pkg.id);
	client.sendSeen(msg.from);
}

export function handle_internal_error(pkg) {
	if (pkg.cause.id == 2) {
		client.sendMessage(message_get(pkg.cause.data.id).from, "Internal error: " + pkg.message);
	} else {
		log("Error not caused by a on_message pkg. Can't send informative message.");
	}
}

export function handle_key_auth_response(pkg) {
	if (!pkg.success) {
		throw new Error("Auth failed!");
	} else {
		log("Auth success!");
		client_init();
	}
}

export function handle_message_send_media(pkg) {
	log("Answering to message " + pkg.id + " with " + pkg.path);


	client.sendMessage(message_get(pkg.id).from, wwebjs.MessageMedia.fromFilePath(pkg.path), {
		sendMediaAsSticker: pkg.type == from_server.message_send_media_pkg_type.sticker
	});
}

export function handle_set_bot_status(pkg) {
	log("Setting bot status to " + pkg.status);
	client.setStatus(pkg.status);
}