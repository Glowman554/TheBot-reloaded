#include <nlohmann/json.hpp>

#include <iostream>

int main() {
	nlohmann::json json;

	std::vector<std::string> vect;
	json["a"] = vect;

	std::cout << json.dump() << std::endl;
}