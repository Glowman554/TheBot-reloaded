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

#define pkg_case(pkg_id, pkg_type, pkg_handler) \
	case protocol::from_sv::pkg_id: \
	this->pkg_handler(protocol::parser::pkg_type(json["data"])); \
	break;

void connection::on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) {
	if (msg->get_opcode() == websocketpp::frame::opcode::text) {
		auto json = nlohmann::json::parse(msg->get_payload());

		int pkg_id = json["id"];

		switch (pkg_id) {
			pkg_case(_message_send, message_send, on_message_send);
			pkg_case(_message_send_ack, message_send_ack, on_message_send_ack);
			pkg_case(_internal_error, internal_error, on_internal_error);
			pkg_case(_config_response, config, on_config);
			pkg_case(_key_auth_response, key_auth_response, on_auth);

		default:
			std::cout << "Unknown packet " << pkg_id << "!" << std::endl;
			break;
		}
	}
}

void connection::on_message_send(protocol::message_send pkg) {
	std::cout << "MSG " << pkg.message << " " << pkg.id << std::endl;
}

void connection::on_message_send_ack(protocol::message_send_ack pkg) {
	std::cout << "ACK " << pkg.id << std::endl;
}

void connection::on_internal_error(protocol::internal_error pkg) {
	std::cout << "ERR " << pkg.message << " " << pkg.cause.dump() << std::endl;
}

void connection::on_config(protocol::config pkg) {
	this->config_helper.on_config(pkg);
}


void connection::on_auth(protocol::key_auth_response pkg) {
	std::cout << "AUTH " << pkg.success << std::endl;
}
