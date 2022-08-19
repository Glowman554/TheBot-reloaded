import wwebjs from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

import { log } from './log.js';
import { send_to_server, connect_server, config_get } from './server.js';

var messages = {};

// TODO: rewrite this shit

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

connect_server('ws://localhost:8080/');

const client = new wwebjs.Client({
	authStrategy: new wwebjs.LocalAuth()
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

	var pkg = {
		id: 2,
		data: {
			message: msg.body,
			chat_id: msg.from,
			user_id: msg.author || msg.from,
			id: message_register(msg),
			quote_text: msg.hasQuotedMsg ? (await msg.getQuotedMessage()).body : undefined,
			mentions: msg.mentionedIds
		}
	}

	send_to_server(pkg);
});

client.initialize();


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
	}
}