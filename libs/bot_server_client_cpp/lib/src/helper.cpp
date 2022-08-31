#include <connection.h>

using namespace helper;

void config_helper::on_config(protocol::config config) {
	this->config = config;
	this->config_ready = true;
}

nlohmann::json config_helper::get(std::string const& section, std::string const& key, connection* con) {
	this->config_ready = false;

	con->config(section, key);

	while (!this->config_ready) {}

	return this->config.config;
}

void tmp_helper::on_tmp(protocol::tmp tmp) {
	this->tmp = tmp;
	this->tmp_ready = true;
}

std::string tmp_helper::get(std::string const& ext, int ttl, connection* con) {
	this->tmp_ready = false;

	con->tmp(ext, ttl);

	while (!this->tmp_ready) {}

	return this->tmp.path;
}