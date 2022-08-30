#include <socket.h>

#include <iostream>

websocket_context::websocket_context() {
}

void websocket_context::on_open(client* c, websocketpp::connection_hdl hdl) {
	this->connected = true;
	std::cout << "on_open()" << std::endl;
}

void websocket_context::on_fail(client* c, websocketpp::connection_hdl hdl) {
	this->connected = false;
	std::cout << "on_fail()" << std::endl;
}

void websocket_context::on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) {
	if (msg->get_opcode() == websocketpp::frame::opcode::text) {
		std::cout << "on_message() " + msg->get_payload() << std::endl;
	}
}

void websocket_context::on_close(client* c, websocketpp::connection_hdl hdl) {
	this->connected = false;
	std::cout << "on_close()" << std::endl;
}

bool websocket_context::send(std::string message, client* c) {
	websocketpp::lib::error_code ec;

	c->send(this->hdl, message, websocketpp::frame::opcode::text, ec);
	if (ec) {
		std::cout << "> Error sending message: " << ec.message() << std::endl;
		return false;
	} else {
		return true;
	}
}

websocketpp::connection_hdl websocket_context::get_hdl() {
	return this->hdl;
}

void websocket_context::set_hdl(websocketpp::connection_hdl hdl) {
	this->hdl = hdl;
}

void websocket_context::await() {
	while (!this->connected) {
		sleep(1);
	}
}

int websocket_context::get_id() {
	return this->id;
}

void websocket_context::set_id(int id) {
	this->id = id;
}

bool websocket_context::get_connected() {
	return this->connected;
}

websocket_endpoint::websocket_endpoint() {
	this->next_id = 0;
	this->endpoint.clear_access_channels(websocketpp::log::alevel::all);
	this->endpoint.clear_error_channels(websocketpp::log::elevel::all);

	this->endpoint.init_asio();
	this->endpoint.start_perpetual();

	this->thread.reset(new websocketpp::lib::thread(&client::run, &this->endpoint));
}

websocket_endpoint::~websocket_endpoint() {
	this->endpoint.stop_perpetual();

	for (con_list::const_iterator it = this->connection_list.begin(); it != this->connection_list.end(); ++it) {
		std::cout << "> Closing connection " << it->second->get_id() << std::endl;

		websocketpp::lib::error_code ec;
		this->endpoint.close(it->second->get_hdl(), websocketpp::close::status::going_away, "", ec);
		if (ec) {
			std::cout << "> Error closing connection " << it->second->get_id() << ": " << ec.message() << std::endl;
		}
	}

	this->thread->join();
}

int websocket_endpoint::connect(std::string const& uri, websocket_context* ctx) {
	websocketpp::lib::error_code ec;

	client::connection_ptr con = this->endpoint.get_connection(uri, ec);

	if (ec) {
		std::cout << "> Connect initialization error: " << ec.message() << std::endl;
		return -1;
	}

	int new_id = this->next_id++;
	websocket_context::ptr metadata_ptr(ctx);
	metadata_ptr->set_id(new_id);
	metadata_ptr->set_hdl(con->get_handle());
	this->connection_list[new_id] = metadata_ptr;

	con->set_open_handler(websocketpp::lib::bind(&websocket_context::on_open, metadata_ptr, &this->endpoint, websocketpp::lib::placeholders::_1));
	con->set_fail_handler(websocketpp::lib::bind(&websocket_context::on_fail, metadata_ptr, &this->endpoint, websocketpp::lib::placeholders::_1));
	con->set_close_handler(websocketpp::lib::bind(&websocket_context::on_close, metadata_ptr, &this->endpoint, websocketpp::lib::placeholders::_1));
	con->set_message_handler(websocketpp::lib::bind(&websocket_context::on_message, metadata_ptr, websocketpp::lib::placeholders::_1, websocketpp::lib::placeholders::_2));
	this->endpoint.connect(con);

	return new_id;
}

int websocket_endpoint::connect(std::string const& uri) {
	return this->connect(uri, new websocket_context());
}

void websocket_endpoint::close(int id, websocketpp::close::status::value code, std::string reason) {
	websocketpp::lib::error_code ec;

	con_list::iterator metadata_it = this->connection_list.find(id);
	if (metadata_it == this->connection_list.end()) {
		std::cout << "> No connection found with id " << id << std::endl;
		return;
	}

	this->endpoint.close(metadata_it->second->get_hdl(), code, reason, ec);
	if (ec) {
		std::cout << "> Error initiating close: " << ec.message() << std::endl;
	}
}

client* websocket_endpoint::get_client() {
	return &this->endpoint;
}

websocket_context::ptr websocket_endpoint::get(int id) {
	for (con_list::const_iterator it = this->connection_list.begin(); it != this->connection_list.end(); ++it) {
		if (it->second->get_id() == id) {
			return it->second;
		}
	}

	return nullptr;
}
