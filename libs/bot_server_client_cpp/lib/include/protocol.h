#pragma once

#include <nlohmann/json.hpp>

namespace protocol {
	namespace from_sv {
		enum pkg_ids {
			_message_send = 1,
			_message_send_ack = 2,
			_internal_error_pkg = 3,
			_config_response = 4,
			_key_auth_response = 5,
			_message_send_media = 6,
			_set_bot_status = 7,
			_tmp_file_response = 8,
		};
	}

	namespace to_sv {
		enum pkg_ids {
			_log = 1,
			_on_message = 2,
			_config_request = 3,
			_tmp_file_request = 4,
		};
	}

	struct key_auth_response {
		bool success;
	};

	key_auth_response key_auth_response_parse(nlohmann::json json);
} // namespace protocol