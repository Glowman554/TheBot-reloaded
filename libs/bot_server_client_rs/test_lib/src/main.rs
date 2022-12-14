extern crate bot_server_client;
use async_trait::async_trait;
use bot_server_client::client::connection::Connection;
use bot_server_client::client::protocol::*;
use bot_server_client::helper::{CFG, TMP};

struct PacketHandlers {}

#[async_trait]
impl bot_server_client::client::connection::PacketHandlers for PacketHandlers {
	async fn message_send(&self, pkg: &MessageSend) {
		println!("MSG {} {}", pkg.message, pkg.id);
	}

	async fn message_send_ack(&self, pkg: &MessageSendAck) {
		println!("ACK {}", pkg.id);
	}

	async fn internal_error(&self, pkg: &InternalError) {
		println!("ERR {} {}", pkg.message, pkg.cause);
	}

	async fn config_get_response(&self, pkg: &ConfigGetResponse) {
		CFG.lock().unwrap().config_get_response(pkg);
	}

	async fn auth_response(&self, pkg: &AuthResponse) {
		println!("AUTH {}", pkg.success);
	}

	async fn message_send_media(&self, pkg: &MessageSendMedia) {
		println!("MSG {:?} {} {}", pkg._type, pkg.path, pkg.id);
	}

	async fn set_bot_status(&self, pkg: &SetBotStatus) {
		println!("STATUS {}", pkg.status);
	}

	async fn tmp_file_response(&self, pkg: &TmpFileResponse) {
		TMP.lock().unwrap().tmp_file_response(pkg);
	}
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
	let connection = Connection::new("ws://172.24.1.87:8080".to_owned(), Box::new(PacketHandlers {}));
	connection.debug(true);
	connection.authenticate("thebestbot");
	connection.log("rust", "hewoo");

	connection.on_message("owo!ping", "rust", "rust", Option::None, Option::None, Option::None, 69);
	connection.on_message("owo!fox", "rust", "rust", Option::None, Option::None, Option::None, 69);

	connection.await_exit().await;
}
