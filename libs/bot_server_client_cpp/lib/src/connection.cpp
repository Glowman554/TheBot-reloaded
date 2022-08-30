#include <connection.h>

connection::connection(client* _client) {
	this->_client = _client;
}

void connection::authenticate(std::string const& token) {
	this->await();
	this->send("auth:" + token, this->_client);
}

void connection::on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) {
	if (msg->get_opcode() == websocketpp::frame::opcode::text) {
		std::cout << "owo on_message() " + msg->get_payload() << std::endl;
	}
}