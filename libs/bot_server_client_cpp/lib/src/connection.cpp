#include <connection.h>
#include <iostream>
#include <nlohmann/json.hpp>

connection::connection(client* _client) {
	this->_client = _client;
}

void connection::authenticate(std::string const& token) {
	this->await();
	this->send("auth:" + token, this->_client);
}

void connection::log(std::string const& client_name, std::string const& msg) {
	this->await();

	nlohmann::json pkg_data;

	pkg_data["client_name"] = client_name;
	pkg_data["message"] = msg;

	nlohmann::json pkg;

	pkg["id"] = protocol::to_sv::_log;
	pkg["data"] = pkg_data;

	this->send(pkg.dump(), this->_client);
}

void connection::message(std::string const& msg, std::string const& user_id, std::string const& chat_id, std::vector<std::string> const& mentions, std::string const& quote_text, std::vector<std::string> const& files, int id) {
	this->await();

	nlohmann::json pkg_data;

	pkg_data["message"] = msg;
	pkg_data["user_id"] = user_id;
	pkg_data["chat_id"] = user_id;
	pkg_data["user_id"] = user_id;
	pkg_data["mentions"] = mentions;
	pkg_data["quote_text"] = quote_text;
	pkg_data["files"] = files;
	pkg_data["id"] = id;

	nlohmann::json pkg;

	pkg["id"] = protocol::to_sv::_on_message;
	pkg["data"] = pkg_data;

	this->send(pkg.dump(), this->_client);
}

void connection::config(std::string const& section, std::string const& key) {
	this->await();

	nlohmann::json pkg_data;

	pkg_data["section"] = section;
	pkg_data["key"] = key;

	nlohmann::json pkg;

	pkg["id"] = protocol::to_sv::_config_request;
	pkg["data"] = pkg_data;

	this->send(pkg.dump(), this->_client);
}

void connection::tmp(std::string const& ext, int ttl) {
	this->await();

	nlohmann::json pkg_data;

	pkg_data["ext"] = ext;
	pkg_data["ttl"] = ttl;

	nlohmann::json pkg;

	pkg["id"] = protocol::to_sv::_tmp_file_request;
	pkg["data"] = pkg_data;

	this->send(pkg.dump(), this->_client);
}

void connection::on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) {
	if (msg->get_opcode() == websocketpp::frame::opcode::text) {
		auto json = nlohmann::json::parse(msg->get_payload());

		int pkg_id = json["id"];

		switch (pkg_id) {
		case protocol::from_sv::_key_auth_response:
			this->on_auth(protocol::key_auth_response_parse(json["data"]));
			break;

		default:
			std::cout << "Unknown packet " << pkg_id << "!" << std::endl;
			break;
		}
	}
}

void connection::on_auth(protocol::key_auth_response pkg) {
	std::cout << "AUTH " << pkg.success << std::endl;
}
