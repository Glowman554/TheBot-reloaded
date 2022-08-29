extern crate json;
use crate::client::connection::Connection;
use crate::client::protocol::{ConfigGetResponse, TmpFileResponse};
use lazy_static::lazy_static;
use std::sync::Mutex;

pub struct ConfigGetHelper {
	cfg: Option<String>,
}

impl ConfigGetHelper {
	pub fn new() -> ConfigGetHelper {
		let cfg = Option::None;

		ConfigGetHelper { cfg }
	}

	pub fn config_get_response(&mut self, pkg: &ConfigGetResponse) {
		self.cfg = Option::Some(pkg.config.clone());
	}

	pub async fn request(&mut self, con: &Connection, section: &str, key: &str) {
		self.cfg = Option::None;
		con.config_request(section, key).await;
	}

	pub fn data(&self) -> &Option<String> {
		&self.cfg
	}
}

pub struct TmpFileHelper {
	path: Option<String>,
}

impl TmpFileHelper {
	pub fn new() -> TmpFileHelper {
		let path = Option::None;

		TmpFileHelper { path }
	}

	pub fn tmp_file_response(&mut self, pkg: &TmpFileResponse) {
		self.path = Option::Some(pkg.path.clone());
	}

	pub async fn request(&mut self, con: &Connection, ext: &str, ttl: i32) {
		self.path = Option::None;
		con.tmp_file_request(ext, ttl).await;
	}

	pub fn data(&self) -> &Option<String> {
		&self.path
	}
}

lazy_static! {
	pub static ref CFG: Mutex<ConfigGetHelper> = Mutex::new(ConfigGetHelper::new());
	pub static ref TMP: Mutex<TmpFileHelper> = Mutex::new(TmpFileHelper::new());
}

pub async fn cfg(connection: &Connection, section: &str, key: &str) -> String {
	CFG.lock().unwrap().request(&connection, section, key).await;
	loop {
		match CFG.lock().unwrap().data() {
			None => {}
			Some(s) => {
				return s[..].to_owned();
			}
		}
	}
}

pub async fn tmp(connection: &Connection, ext: &str, ttl: i32) -> String {
	TMP.lock().unwrap().request(&connection, ext, ttl).await;
	loop {
		match TMP.lock().unwrap().data() {
			None => {}
			Some(s) => {
				return s[..].to_owned();
			}
		}
	}
}
