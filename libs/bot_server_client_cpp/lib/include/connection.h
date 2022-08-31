#pragma once

#include <protocol.h>
#include <socket.h>

class connection;

namespace helper {
    class config_helper {
        public:
            void on_config(protocol::config config);
            nlohmann::json get(std::string const& section, std::string const& key, connection* con);

        private:
            protocol::config config;
            bool config_ready;
    };
}

class connection : public websocket_context {
public:
	connection(client* _client);

	virtual void on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) override;

	void authenticate(std::string const& token);
	void log(std::string const& client_name, std::string const& msg);
	void message(std::string const& msg, std::string const& user_id, std::string const& chat_id, std::vector<std::string> const& mentions, std::string const& quote_text, std::vector<std::string> const& files, int id);
	void config(std::string const& section, std::string const& key);
	void tmp(std::string const& ext, int ttl);

	virtual void on_message_send(protocol::message_send pkg);
	virtual void on_message_send_ack(protocol::message_send_ack pkg);
	virtual void on_internal_error(protocol::internal_error pkg);
	virtual void on_config(protocol::config pkg);
	virtual void on_auth(protocol::key_auth_response pkg);

	helper::config_helper config_helper;

private:
	client* _client;
};