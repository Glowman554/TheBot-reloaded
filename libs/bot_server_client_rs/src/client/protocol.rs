extern crate json;

pub const MESSAGE_SEND_ID: i64 = 1;
pub struct MessageSend {
	pub message: String,
	pub id: i64,
}
impl MessageSend {
	pub fn new(json: &json::JsonValue) -> MessageSend {
		let message = json["message"].as_str().unwrap().to_owned();
		let id = json["id"].as_i64().unwrap();

		MessageSend { message, id }
	}
}

pub const MESSAGE_SEND_ACK_ID: i64 = 2;
pub struct MessageSendAck {
	pub id: i64,
}
impl MessageSendAck {
	pub fn new(json: &json::JsonValue) -> MessageSendAck {
		let id = json["id"].as_i64().unwrap();

		MessageSendAck { id }
	}
}

pub const INTERNAL_ERROR_ID: i64 = 3;
pub struct InternalError<'a> {
	pub message: String,
	pub cause: &'a json::JsonValue,
}
impl InternalError<'_> {
	pub fn new(json: &json::JsonValue) -> InternalError {
		let message = json["message"].as_str().unwrap().to_owned();
		let cause = &json["cause"];

		InternalError { message, cause }
	}
}

pub const CONFIG_GET_RESPONSE_ID: i64 = 4;
pub struct ConfigGetResponse {
	pub key: String,
	pub section: String,
	pub config: String,
}
impl ConfigGetResponse {
	pub fn new(json: &json::JsonValue) -> ConfigGetResponse {
		let key = json["key"].as_str().unwrap().to_owned();
		let section = json["section"].as_str().unwrap().to_owned();
		let config = json["config"].dump();

		ConfigGetResponse { key, section, config }
	}
}

pub const AUTH_RESPONSE_ID: i64 = 5;
pub struct AuthResponse {
	pub success: bool,
}
impl AuthResponse {
	pub fn new(json: &json::JsonValue) -> AuthResponse {
		let success = json["success"].as_bool().unwrap();

		AuthResponse { success }
	}
}

pub const MESSAGE_SEND_MEDIA_ID: i64 = 6;
#[derive(Debug)]
pub enum MessageMediaType {
	PICTURE = 1,
	VIDEO = 2,
	STICKER = 3,
	AUDIO = 4,
}
pub struct MessageSendMedia {
	pub _type: MessageMediaType,
	pub path: String,
	pub id: i64,
}
impl MessageSendMedia {
	pub fn new(json: &json::JsonValue) -> MessageSendMedia {
		let _type = MessageSendMedia::mmt_from_i64(json["type"].as_i64().unwrap());
		let path = json["path"].as_str().unwrap().to_owned();
		let id = json["id"].as_i64().unwrap();

		MessageSendMedia { _type, path, id }
	}

	fn mmt_from_i64(_type: i64) -> MessageMediaType {
		match _type {
			1 => MessageMediaType::PICTURE,
			2 => MessageMediaType::VIDEO,
			3 => MessageMediaType::STICKER,
			4 => MessageMediaType::AUDIO,
			_ => panic!("Cannot convert {} to MessageMediaType", _type),
		}
	}
}

pub const SET_BOT_STATUS_ID: i64 = 7;
pub struct SetBotStatus {
	pub status: String,
}
impl SetBotStatus {
	pub fn new(json: &json::JsonValue) -> SetBotStatus {
		let status = json["status"].as_str().unwrap().to_owned();

		SetBotStatus { status }
	}
}

pub const TMP_FILE_RESPONSE_ID: i64 = 8;
pub struct TmpFileResponse {
	pub path: String,
	pub ext: String,
}
impl TmpFileResponse {
	pub fn new(json: &json::JsonValue) -> TmpFileResponse {
		let ext = json["ext"].as_str().unwrap().to_owned();
		let path = json["path"].as_str().unwrap().to_owned();

		TmpFileResponse { path, ext }
	}
}
