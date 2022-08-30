#pragma once

#include <socket.h>
#include <protocol.h>

class connection : public websocket_context {
public:
	connection(client* _client);

	virtual void on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) override;

	void authenticate(std::string const& token);

	virtual void on_auth(protocol::key_auth_response pkg);

private:
	client* _client;
};