#include <connection.h>
#include <iostream>
#include <protocol.h>
#include <socket.h>
#include <tgbot/tgbot.h>
#include <fstream>
#include <nlohmann/json.hpp>

#define MAX_IDS 1000
std::atomic<int64_t> ids[MAX_IDS];
int current_id = 0;

int id_add(int64_t id) {
	if (current_id % MAX_IDS == 0) {
		current_id = 0;
	}

	ids[current_id].store(id, std::memory_order_relaxed);
	return current_id++;
}

int id_get(int id) {
	int64_t lid = ids[id].load(std::memory_order_relaxed);
	return lid;
}

std::string read_from_file(std::string const& file) {
	std::ifstream f(file);

	if (f.fail()) {
		throw std::runtime_error("Failed to open file" + file);
	}

	std::stringstream buf;
	buf << f.rdbuf();

	return buf.str();
}

TgBot::Bot bot = TgBot::Bot("");

class custom_connection : public connection {
	public:
		custom_connection(client* c) : connection(c) {}

		virtual void on_auth(protocol::key_auth_response pkg) override {
			std::cout << "In my custom auth (" << pkg.success << ")" << std::endl;
		}

		virtual void on_message_send(protocol::message_send pkg) override {
			connection::on_message_send(pkg);

			bot.getApi().sendMessage(id_get(pkg.id), pkg.message);
		}

		virtual void on_open(client* c, websocketpp::connection_hdl hdl) override {
			std::cout << "In custom on_open" << std::endl;

			connection::on_open(c, hdl); // calling the super function here is VERY IMPORTANT
		}

		virtual void on_fail(client* c, websocketpp::connection_hdl hdl) override {
			connection::on_fail(c, hdl);
			exit(-1);
		}
};

int main(int argc, char* argv[]) {
	if (argc != 2) {
		std::cout << "Usage: " << argv[0] << " [connection_file]" << std::endl;
		return 1;
	}

	nlohmann::json connection_config = nlohmann::json::parse(read_from_file(std::string(argv[1])));

	std::cout << connection_config << std::endl;

	websocket_endpoint endp;

	auto con = new custom_connection(endp.get_client());
	int id = endp.connect(connection_config["url"], con);

	con->authenticate(connection_config["key"]);
	
	auto sock = endp.get(id);

	new(&bot) TgBot::Bot(con->config_helper.get("telegram", "token", con));

	bot.getEvents().onAnyMessage([&con](TgBot::Message::Ptr message) {
		printf("User %d wrote %s\n", message->from->id, message->text.c_str());
		if (StringTools::startsWith(message->text, "/start")) {
			return;
		}

		std::string user_id = std::to_string(message->from->id);
		std::string chat_id = std::to_string(message->chat->id);

		con->message(message->text, user_id, chat_id, std::vector<std::string> {}, {}, std::vector<std::string> {}, id_add(message->chat->id));
	});

	try {
		printf("Bot username: %s\n", bot.getApi().getMe()->username.c_str());
		TgBot::TgLongPoll longPoll(bot);
		while (sock->get_connected()) {
			printf("Long poll started\n");
			longPoll.start();
		}
	} catch (TgBot::TgException& e) {
		printf("error: %s\n", e.what());
	}
}