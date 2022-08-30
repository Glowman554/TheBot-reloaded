#include <websocketpp/client.hpp>
#include <websocketpp/config/asio_no_tls_client.hpp>

typedef websocketpp::client<websocketpp::config::asio_client> client;

class websocket_context {
public:
	typedef websocketpp::lib::shared_ptr<websocket_context> ptr;

	websocket_context(int id, websocketpp::connection_hdl hdl);
	void on_open(client* c, websocketpp::connection_hdl hdl);
	void on_fail(client* c, websocketpp::connection_hdl hdl);
	void on_message(websocketpp::connection_hdl hdl, client::message_ptr msg);
	void on_close(client* c, websocketpp::connection_hdl hdl);
	bool send(std::string message, client* c);

	void await();

	websocketpp::connection_hdl get_hdl();
	int get_id();
	bool get_connected();

private:
	int id;
	websocketpp::connection_hdl hdl;
	bool connected = false;
};

class websocket_endpoint {
public:
	websocket_endpoint();
	~websocket_endpoint();
	int connect(std::string const& uri);
	void close(int id, websocketpp::close::status::value code, std::string reason);

	websocket_context::ptr get(int id);

    client* get_client();

private:
	typedef std::map<int, websocket_context::ptr> con_list;

	client endpoint;
	websocketpp::lib::shared_ptr<websocketpp::lib::thread> thread;

	con_list connection_list;
	int next_id;
};