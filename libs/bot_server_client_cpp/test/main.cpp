#include <iostream>
#include <socket.h>

int main() {
	websocket_endpoint endp;
	
    int id = endp.connect("ws://172.24.1.87:8080");
	
    auto sock = endp.get(id);
	sock->await();
	sock->send("auth:thebestbot", endp.get_client());

	while (sock->get_connected()) {
		sleep(1);
	}
}