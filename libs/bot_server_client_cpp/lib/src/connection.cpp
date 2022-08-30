#include <connection.h>
#include <nlohmann/json.hpp>
#include <iostream>

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
			default:
				std::cout << "Unknown packet " << pkg_id << "!" << std::endl;
				break;
		}
	}
}