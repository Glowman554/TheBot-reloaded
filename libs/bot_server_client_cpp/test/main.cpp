#include <connection.h>
#include <iostream>
#include <protocol.h>
#include <socket.h>

class custom_connection : public connection {
	public:
		custom_connection(client* c) : connection(c) {}

		virtual void on_auth(protocol::key_auth_response pkg) override {
			std::cout << "In my custom auth (" << pkg.success << ")" << std::endl;
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

	std::cout << con->config_helper.get("root", "command_prefix", con).dump() << std::endl;
	std::cout << con->tmp_helper.get("txt", 10, con) << std::endl;

	con->message("owo!ping", "cpp", "cpp", std::vector<std::string>{}, "", std::vector<std::string>{}, 10);

	auto sock = endp.get(id);

	while (sock->get_connected()) {
		sleep(1);
	}
}