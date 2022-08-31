#pragma once

#include <nlohmann/json.hpp>

namespace protocol {
	namespace from_sv {
		enum pkg_ids {
			_message_send = 1,
			_message_send_ack = 2,
			_internal_error = 3,
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

	struct message_send {
		std::string message;
		int id;
	};

	struct message_send_ack {
		int id;
	};

	struct internal_error {
		std::string message;
		nlohmann::json cause;
	};

	struct key_auth_response {
		bool success;
	};

	struct config {
		std::string key;
		std::string section;
		nlohmann::json config;
	};

	enum message_send_media_type {
		picture = 1,
		video = 2,
		sticker = 3,
		audio = 4,
	};
	struct message_send_media {
		message_send_media_type type;
		std::string path;
		int id;
	};

	struct set_bot_status {
		std::string status;
	};

	struct tmp {
		std::string path;
		std::string ext;
	};

#define pkg_parser(pkg) pkg pkg(nlohmann::json json)
#define pkg_parser_impl(pkg) pkg protocol::parser::pkg(nlohmann::json json)

	namespace parser {
		pkg_parser(message_send);
		pkg_parser(message_send_ack);
		pkg_parser(internal_error);
		pkg_parser(config);
		pkg_parser(key_auth_response);
		pkg_parser(message_send_media);
		pkg_parser(set_bot_status);
		pkg_parser(tmp);
	} // namespace parser
} // namespace protocol