import { ConfigParser, ConfigSections } from "./config.ts";

interface ConfigGen {
	section: string;
	key: string;
	default: any;
}

var config_gen: ConfigGen[] = [];
function config_gen_add(section: string, key: string, default_value: any) {
	config_gen.push({ section: section, key: key, default: default_value });
}

async function main() {
	config_gen_add("root", "log_folder", "./logs");
	config_gen_add("root", "tmp_folder", "./tmp");
	config_gen_add("root", "command_prefix", undefined);
	config_gen_add("root", "permissions_file", "./permissions.json");

	config_gen_add("websocket", "port", 8080);
	config_gen_add("websocket", "key", undefined);
	config_gen_add("websocket", "log_packets", false);

	config_gen_add("permissions", "admin", ["crash"]);

	config_gen_add("discord", "token", undefined);

	config_gen_add("whatsapp", "puppeteer_args", ["--no-sandbox"]);

	var cfg: ConfigSections = {};
	for (var gen of config_gen) {
		var default_value = gen.default !== undefined ? JSON.stringify(gen.default) : undefined;

		var input = prompt(":" + gen.section + "." + gen.key + (default_value !== undefined ? " [" + default_value + "]" : "") + ": ");
		if (!input && default_value === undefined) {
			throw new Error("No value given for " + gen.section + "." + gen.key);
		}

		var value = String(input !== null ? input : default_value);
		if (cfg[gen.section] == null) {
			console.log("created section " + gen.section);
			cfg[gen.section] = {};
		}
		try {
			cfg[gen.section][gen.key] = JSON.parse(value);
		} catch (e) {
			cfg[gen.section][gen.key] = value;
		}
	}

	var config_parser = new ConfigParser("");
	config_parser.config_sections = cfg;

	Deno.writeTextFileSync("./config.cfg", config_parser.gen());
}

main();
