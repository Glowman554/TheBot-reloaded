#include <connection.h>
#include <iostream>
#include <socket.h>
#include <protocol.h>

int main() {
	websocket_endpoint endp;

	auto con = new connection(endp.get_client());
	int id = endp.connect("ws://localhost:8080", con);

	con->authenticate("thebestbot");

	auto sock = endp.get(id);

	while (sock->get_connected()) {
		sleep(1);
	}
}