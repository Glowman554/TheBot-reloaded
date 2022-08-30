#include <protocol.h>

using namespace protocol;

key_auth_response protocol::key_auth_response_parse(nlohmann::json json) {
	struct key_auth_response pkg = { 0 };
	pkg.success = json["success"];

	return pkg;
}
