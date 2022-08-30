extern crate json;
extern crate websocket;
use async_trait::async_trait;

use crate::client::protocol::*;

use std::panic;
use std::sync::{
	atomic::{AtomicBool, Ordering},
	Arc, Mutex,
};
use websocket::client::ClientBuilder;
use websocket::OwnedMessage;

pub struct Connection {
	sender: Arc<Mutex<websocket::sender::Writer<std::net::TcpStream>>>,

	exited: Arc<AtomicBool>,
	debug: Arc<AtomicBool>,
}

#[async_trait]
pub trait PacketHandlers {
	async fn message_send(&self, pkg: &MessageSend);
	async fn message_send_ack(&self, pkg: &MessageSendAck);
	async fn internal_error(&self, pkg: &InternalError);
	async fn config_get_response(&self, pkg: &ConfigGetResponse);
	async fn auth_response(&self, pkg: &AuthResponse);
	async fn message_send_media(&self, pkg: &MessageSendMedia);
	async fn set_bot_status(&self, pkg: &SetBotStatus);
	async fn tmp_file_response(&self, pkg: &TmpFileResponse);
}

impl Connection {
	pub fn new(url: String, handlers: Box<dyn PacketHandlers + Send + Sync>) -> Connection {
		let client = ClientBuilder::new(url.as_ref()).unwrap().add_protocol("rust-websocket").connect_insecure().unwrap();

		let (mut r, s) = client.split().unwrap();

		let sender = Arc::new(Mutex::new(s));
		let exited = Arc::new(AtomicBool::from(false));
		let debug = Arc::new(AtomicBool::from(false));

		let rt_sen = sender.clone();
		let rt_exit = exited.clone();
		let rt_debug = debug.clone();

		tokio::spawn(async move {
			let p_exit = rt_exit.clone();
			panic::set_hook(Box::new(move |panic| {
				println!("{}", panic);
				p_exit.store(true, Ordering::Relaxed);
			}));

			for message in r.incoming_messages() {
				let message = message.unwrap();

				match message {
					OwnedMessage::Close(_) => {
						let _ = rt_sen.lock().unwrap().send_message(&OwnedMessage::Close(None));

						if rt_debug.load(Ordering::Relaxed) {
							println!("returning from recv loop!");
						}
						rt_exit.store(true, Ordering::Relaxed);
						return;
					}
					OwnedMessage::Ping(data) => {
						rt_sen.lock().unwrap().send_message(&OwnedMessage::Pong(data)).unwrap();
					}

					OwnedMessage::Text(t) => {
						let json = json::parse(&t).unwrap();
						if rt_debug.load(Ordering::Relaxed) {
							println!("PKG {}", json)
						};

						let id = json["id"].as_i64().unwrap();
						match id {
							MESSAGE_SEND_ID => handlers.message_send(&MessageSend::new(&json["data"])).await,
							MESSAGE_SEND_ACK_ID => handlers.message_send_ack(&MessageSendAck::new(&json["data"])).await,
							INTERNAL_ERROR_ID => handlers.internal_error(&InternalError::new(&json["data"])).await,
							CONFIG_GET_RESPONSE_ID => handlers.config_get_response(&ConfigGetResponse::new(&json["data"])).await,
							AUTH_RESPONSE_ID => handlers.auth_response(&AuthResponse::new(&json["data"])).await,
							MESSAGE_SEND_MEDIA_ID => handlers.message_send_media(&MessageSendMedia::new(&json["data"])).await,
							SET_BOT_STATUS_ID => handlers.set_bot_status(&SetBotStatus::new(&json["data"])).await,
							TMP_FILE_RESPONSE_ID => handlers.tmp_file_response(&TmpFileResponse::new(&json["data"])).await,
							_ => {
								panic!("Unknown packet id {}", id);
							}
						};
					}

					_ => {}
				}
			}
		});

		Connection { sender, exited, debug }
	}

	fn send(&self, msg: String) {
		self.sender.lock().unwrap().send_message(&OwnedMessage::Text(msg)).unwrap();
	}

	pub fn authenticate(&self, key: &str) {
		self.send(format!("auth:{}", key));
	}

	pub fn log(&self, cl: &str, msg: &str) {
		let pkg = json::object! {
			id: 1,
			data: {
				message: msg,
				client_name: cl
			}
		};
		self.send(pkg.dump());
	}

	pub fn on_message(&self, message: &str, user_id: &str, chat_id: &str, files: Option<Box<[&str]>>, mentions: Option<Box<[&str]>>, quote_text: Option<&str>, id: i64) {
		let _mentions = match mentions {
			None => Box::new([]),
			Some(s) => s,
		};

		let _quote_text = match quote_text {
			None => "",
			Some(s) => s,
		};

		let _files = match files {
			None => Box::new([]),
			Some(s) => s,
		};

		let pkg = json::object! {
			id: 2,
			data: {
				message: message,
				user_id: user_id,
				chat_id: chat_id,
				mentions: _mentions.as_ref(),
				quote_text: _quote_text,
				files: _files.as_ref(),
				id: id
			}
		};

		self.send(pkg.dump());
	}

	pub fn config_request(&self, section: &str, key: &str) {
		let pkg = json::object! {
			id: 3,
			data: {
				section: section,
				key: key
			}
		};

		self.send(pkg.dump());
	}

	pub fn tmp_file_request(&self, ext: &str, ttl: i32) {
		let pkg = json::object! {
			id: 4,
			data: {
				ext: ext,
				ttl: ttl
			}
		};

		self.send(pkg.dump());
	}

	pub fn await_exit(&self) {
		loop {
			if self.exited.load(Ordering::Relaxed) {
				break;
			}
		}
	}

	pub fn disconnect(&self) {
		self.sender.lock().unwrap().send_message(&OwnedMessage::Close(None)).unwrap();
	}

	pub fn debug(&self, s: bool) {
		self.debug.store(s, Ordering::Relaxed);
	}
}

impl Drop for Connection {
	fn drop(&mut self) {
		let _ = self.sender.lock().unwrap().send_message(&OwnedMessage::Close(None));

		self.await_exit();
	}
}
