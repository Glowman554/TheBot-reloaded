extern crate bot_server_client;
use bot_server_client::client::connection::Connection;
use bot_server_client::client::protocol::*;
use bot_server_client::helper::{CFG, TMP};

use async_trait::async_trait;

use std::process;
use std::sync::atomic::{AtomicBool, Ordering};
use std::io::{self, BufRead};

use spinoff::{Color, Spinner, Spinners};
use inquire::{validator::Validation, Text};

static AUTH_RESPONSE: AtomicBool = AtomicBool::new(false);
static AUTH_SUCCESS: AtomicBool = AtomicBool::new(false);

struct PacketHandlers {}

#[async_trait]
impl bot_server_client::client::connection::PacketHandlers for PacketHandlers {
	async fn message_send(&self, pkg: &MessageSend) {
		println!("{}", pkg.message.replace("<bg_code>", "").replace("<code>", "").replace("<italic>", ""));
	}

	async fn message_send_ack(&self, _pkg: &MessageSendAck) {}

	async fn internal_error(&self, pkg: &InternalError) {
		println!("Internal error: {}", pkg.message);
	}

	async fn config_get_response(&self, pkg: &ConfigGetResponse) {
		CFG.lock().unwrap().config_get_response(pkg);
	}

	async fn auth_response(&self, pkg: &AuthResponse) {
		AUTH_SUCCESS.store(pkg.success, Ordering::Relaxed);
		AUTH_RESPONSE.store(true, Ordering::Relaxed);
	}

	async fn message_send_media(&self, pkg: &MessageSendMedia) {
		println!("{:?}:{}", pkg._type, pkg.path);
	}

	async fn set_bot_status(&self, _pkg: &SetBotStatus) {}

	async fn tmp_file_response(&self, pkg: &TmpFileResponse) {
		TMP.lock().unwrap().tmp_file_response(pkg);
	}
}

fn question(what: &str, default: &str) -> String {
	let validator = |input: &str| if input.chars().count() > 140 { Ok(Validation::Invalid("You're only allowed 140 characters.".into())) } else { Ok(Validation::Valid) };

	let status = Text::new(what).with_validator(validator).with_default(default).prompt();

	status.unwrap()
}

#[tokio::main]
async fn main() {
	let url = question("server url? ", "ws://172.24.1.87:8080");
	let key = question("server key? ", "thebestbot");

	let mut spinner = Spinner::new(Spinners::Dots, "Connecting...", Color::Blue);
	let connection = Connection::new(url, Box::new(PacketHandlers {})).await;
	// connection.debug(true);
	spinner.update(Spinners::Dots, "Authenticating...", Color::Blue);

	connection.authenticate(&key[..]).await;

	loop {
		if AUTH_RESPONSE.load(Ordering::Relaxed) {
			if AUTH_SUCCESS.load(Ordering::Relaxed) {
				spinner.success("Connected!");
			} else {
				spinner.fail("Authentication failed!!");
				process::exit(1);
			}
			break;
		}
	}

	loop {
		let stdin = io::stdin();
		for line in stdin.lock().lines() {
			connection.on_message(&line.unwrap()[..], "rust", "rust", Option::None, Option::None, Option::None, 1).await;
		}
	}
}
