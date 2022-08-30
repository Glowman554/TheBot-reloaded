#pragma once

#include <nlohmann/json.hpp>

namespace protocol {
    enum pkg_ids {
		message_send = 1,
		message_send_ack = 2,
		internal_error_pkg = 3,
		config_response = 4,
		key_auth_response = 5,
		message_send_media = 6,
		set_bot_status = 7,
		tmp_file_response = 8,
	};

    struct key_auth_response {
        bool success;
    };

    struct key_auth_response key_auth_response_parse(nlohmann::json json);
}