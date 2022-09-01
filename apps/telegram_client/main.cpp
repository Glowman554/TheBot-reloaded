#include <connection.h>
#include <iostream>
#include <protocol.h>
#include <socket.h>
#include <tgbot/tgbot.h>

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
};

int main() {
	websocket_endpoint endp;

	auto con = new custom_connection(endp.get_client());
	int id = endp.connect("ws://172.24.1.87:8080", con);

	con->authenticate("thebestbot");
	con->log("cpp", "Hewoo");
	
	auto sock = endp.get(id);

	new(&bot) TgBot::Bot(con->config_helper.get("telegram", "token", con));

	bot.getEvents().onAnyMessage([&con](TgBot::Message::Ptr message) {
		printf("User wrote %s\n", message->text.c_str());
		if (StringTools::startsWith(message->text, "/start")) {
			return;
		}
		con->message(message->text, "cpp", "cpp", std::vector<std::string> {}, {}, std::vector<std::string> {}, id_add(message->chat->id));
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