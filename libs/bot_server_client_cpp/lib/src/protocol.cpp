#include <protocol.h>

using namespace protocol;

pkg_parser_impl(message_send) {
	return {.message = json["message"], .id = json["id"]};
}

pkg_parser_impl(message_send_ack) {
	return {.id = json["id"]};
}
pkg_parser_impl(internal_error) {
	return {.message = json["message"], .cause = json["cause"]};
}

pkg_parser_impl(config) {
	return {.key = json["key"], .section = json["section"], .config = json["config"]};
}

pkg_parser_impl(key_auth_response) {
	return {.success = json["success"]};
}
