#include <connection.h>
#include <iostream>
#include <protocol.h>
#include <socket.h>

int main() {
	websocket_endpoint endp;

	auto con = new connection(endp.get_client());
	int id = endp.connect("ws://172.24.1.87:8080", con);

	con->authenticate("thebestbot");

	auto sock = endp.get(id);

	while (sock->get_connected()) {
		sleep(1);
	}
}