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

void connection::on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) {
	if (msg->get_opcode() == websocketpp::frame::opcode::text) {
		auto json = nlohmann::json::parse(msg->get_payload());

		int pkg_id = json["id"];

		switch (pkg_id) {
		case protocol::_key_auth_response:
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
