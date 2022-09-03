#include <connection.h>
#include <iostream>
#include <protocol.h>
#include <socket.h>
#include <tgbot/tgbot.h>
#include <fstream>
#include <nlohmann/json.hpp>
#include <mime.h>
#include <assert.h>

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

std::string extension(std::string const& file_name) {
	int position = file_name.find_last_of(".");

	std::string result = file_name.substr(position + 1);

	return result;
}

void download(std::string const& url, std::string const& path) {
	assert(system(("curl " + url + " -o " + path).c_str()) == 0);
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

		virtual void on_message_send_media(protocol::message_send_media pkg) override {
			switch (pkg.type) {
				case protocol::audio:
					bot.getApi().sendAudio(id_get(pkg.id), TgBot::InputFile::fromFile(pkg.path, mime(extension(pkg.path))));
					break;
				case protocol::picture:
					bot.getApi().sendPhoto(id_get(pkg.id), TgBot::InputFile::fromFile(pkg.path, mime(extension(pkg.path))));
					break;
				case protocol::sticker:
					bot.getApi().sendSticker(id_get(pkg.id), TgBot::InputFile::fromFile(pkg.path, mime(extension(pkg.path))));
					break;
				case protocol::video:
					bot.getApi().sendVideo(id_get(pkg.id), TgBot::InputFile::fromFile(pkg.path, mime(extension(pkg.path))));
					break;
			}
		}

		virtual void on_internal_error(protocol::internal_error pkg) override {
			if (pkg.cause["id"] == protocol::to_sv::_on_message) {
				int id = pkg.cause["data"]["id"];

				bot.getApi().sendMessage(id_get(id), "Internal error: " + pkg.message);
			} else {
				std::cout << "Oops: " << pkg.message << std::endl;
			}
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
		// printf("User %ld wrote %s\n", message->from->id, message->text.c_str());
		std::cout << "User " << message->from->id << " wrote " << message->text << std::endl;
		if (StringTools::startsWith(message->text, "/start")) {
			return;
		}

		std::string user_id = std::to_string(message->from->id);
		std::string chat_id = std::to_string(message->chat->id);

		std::vector<std::string> files {};

		std::optional<std::string> quote_text = {};
		if (message->replyToMessage) {
			quote_text = message->replyToMessage->text;
		}

		for (int i = 0; i < message->photo.size(); i++) {
			std::string url = "https://api.telegram.org/file/bot" + std::string(con->config_helper.get("telegram", "token", con)) + "/" + bot.getApi().getFile(message->photo[i]->fileId)->filePath;
			std::string path = con->tmp_helper.get(extension(url), 1000 * 60 * 5, con);
			files.push_back(path);

			download(url, path);
		}

		if (message->audio) {
			std::string url = "https://api.telegram.org/file/bot" + std::string(con->config_helper.get("telegram", "token", con)) + "/" + bot.getApi().getFile(message->audio->fileId)->filePath;
			std::string path = con->tmp_helper.get(extension(url), 1000 * 60 * 5, con);
			files.push_back(path);

			download(url, path);
		}

		if (message->document) {
			std::string url = "https://api.telegram.org/file/bot" + std::string(con->config_helper.get("telegram", "token", con)) + "/" + bot.getApi().getFile(message->document->fileId)->filePath;
			std::string path = con->tmp_helper.get(extension(url), 1000 * 60 * 5, con);
			files.push_back(path);

			download(url, path);
		}

		con->message(message->caption.length() != 0 ? message->caption : message->text, user_id, chat_id, std::vector<std::string> {}, quote_text, files, id_add(message->chat->id));
	});

	try {
		std::cout << "Bot username: " << bot.getApi().getMe()->username << std::endl;
		TgBot::TgLongPoll longPoll(bot);
		bot.getApi().deleteWebhook();

		while (sock->get_connected()) {
			std::cout << "Long poll started" << std::endl;
			longPoll.start();
		}
	} catch (TgBot::TgException& e) {
		std::cout << "error: " << e.what() << std::endl;
	}
}