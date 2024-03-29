// deno-lint-ignore-file no-explicit-any
import { ConfigParser, ConfigSections } from "./config.ts";

interface ConfigGen {
	section: string;
	key: string;
	default: any;
}

const config_gen: ConfigGen[] = [];
function config_gen_add(section: string, key: string, default_value: any) {
	config_gen.push({ section: section, key: key, default: default_value });
}

function main() {
	config_gen_add("root", "log_folder", "./logs");
	config_gen_add("root", "tmp_folder", "./tmp");
	config_gen_add("root", "keystore", "./keystore.txt");
	config_gen_add("root", "command_prefix", undefined);
	config_gen_add("root", "permissions_file", "./permissions.json");
	config_gen_add("root", "hello_on", []);
	config_gen_add("root", "hello", "Hello my name is TheBot and I'm happy to meet you 👍!\nThe person who programs me does this mainly in his free time so don't expect too much from me 🤪!\nI'm mainly made to have fun 👾!");

	config_gen_add("websocket", "port", 8080);
	config_gen_add("websocket", "key", undefined);
	config_gen_add("websocket", "log_packets", false);

	config_gen_add("permissions", "admin", ["crash", "docker", "run-nojail", "eval", "mikki_account", "role", "no_limit", "untis"]);
	config_gen_add("permissions", "mikki_manager", ["mikki_account"]);

	config_gen_add("docker", "proxy", "http://localhost:3565/docker/");
	config_gen_add("compiler", "server", "http://localhost:3566/compiler/");

	config_gen_add("discord", "token", undefined);
	config_gen_add("discord", "owner", undefined);

	config_gen_add("whatsapp", "puppeteer_args", ["--no-sandbox"]);
	config_gen_add("whatsapp", "owner", undefined);

	config_gen_add("telegram", "token", undefined);
	config_gen_add("telegram", "owner", undefined);

	config_gen_add("mikki", "url", undefined);
	config_gen_add("mikki", "token", undefined);

	config_gen_add("backup", "enabled", true);
	config_gen_add("backup", "url", undefined);
	config_gen_add("backup", "token", undefined);

	// config_gen_add("chatbot", "chat_ids", []);
	config_gen_add("chatbot", "key", undefined);
	config_gen_add("chatbot", "bid", undefined);

	config_gen_add("openai", "key", undefined);

	config_gen_add("alice", "url", undefined);

	config_gen_add("untis", "school", undefined);
	config_gen_add("untis", "user", undefined);
	config_gen_add("untis", "pass", undefined);

	const cfg: ConfigSections = {};
	let cfg_override: { [key: string]: any } = {};

	try {
		cfg_override = JSON.parse(Deno.readTextFileSync(Deno.args[0]));
	} catch (_e) {
		console.log("No config override file found");
	}

	for (const gen of config_gen) {
		let save_in_config_override = true;
		let default_value = gen.default !== undefined ? JSON.stringify(gen.default) : undefined;
		if (cfg_override[":" + gen.section + "." + gen.key] !== undefined) {
			default_value = cfg_override[":" + gen.section + "." + gen.key];
			console.log("Overriding " + gen.section + "." + gen.key + " with " + default_value);
			save_in_config_override = false;
		}

		const input = prompt(":" + gen.section + "." + gen.key + (default_value !== undefined ? " [" + default_value + "]" : "") + ": ");
		if (!input && default_value === undefined) {
			throw new Error("No value given for " + gen.section + "." + gen.key);
		}

		const value = String(input !== null ? input : default_value);
		if (cfg[gen.section] == null) {
			console.log("created section " + gen.section);
			cfg[gen.section] = {};
		}
		try {
			cfg[gen.section][gen.key] = JSON.parse(value);
			if (save_in_config_override && default_value != value) {
				cfg_override[":" + gen.section + "." + gen.key] = JSON.parse(value);
			}
		} catch (_e) {
			cfg[gen.section][gen.key] = value;
			if (save_in_config_override && default_value != value) {
				cfg_override[":" + gen.section + "." + gen.key] = value;
			}
		}
	}

	const config_parser = new ConfigParser("");
	config_parser.config_sections = cfg;

	Deno.writeTextFileSync(Deno.args[0], JSON.stringify(cfg_override, null, "\t"));
	Deno.writeTextFileSync("./config.cfg", config_parser.gen());
}

main();
