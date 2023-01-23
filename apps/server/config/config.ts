// deno-lint-ignore-file no-explicit-any
import { supabaseTable } from "https://deno.land/x/supabase_deno@v1.0.5/mod.ts";
import { BackupProvider, random_id } from "../backup/backup_provider.ts";
import { log } from "../logger.ts";

export interface ConfigSections {
	[key: string]: { [key: string]: any };
}

export class ConfigParser implements BackupProvider {
	config: string;

	config_sections: ConfigSections = {};

	constructor(config: string) {
		this.config = config;
	}

	parse(): void {
		const lines = this.config.split("\n");
		let section = "root";
		for (const line of lines) {
			if (line.startsWith(":")) {
				section = line.substring(1).trim();
				log("config", `now in section ${section}`);
			} else if (line.startsWith(";")) {
				// Comment
			} else {
				const parts = line.split("=");
				if (parts.length != 2) {
					continue;
				}

				if (this.config_sections[section] == null) {
					this.config_sections[section] = {};
					log("config", `created section ${section}`);
				}

				try {
					// deno-lint-ignore ban-types
					this.config_sections[section][parts[0].trim()] = JSON.parse(parts[1].trim()) as object;
				} catch (_e) {
					this.config_sections[section][parts[0].trim()] = parts[1].trim();
				}
				log("config", `parsed ${parts[0].trim()} as ${typeof this.config_sections[section][parts[0].trim()]}`);
				log("config", `${parts[0].trim()} = ${this.config_sections[section][parts[0].trim()]}`);
			}
		}

		// log("config", this.gen());
	}

	get(key: string, section = "root"): any {
		if (this.config_sections[section] == null) {
			throw new Error(`Section ${section} not found`);
		}

		if (this.config_sections[section][key] == null) {
			throw new Error(`Key ${key} not found in section ${section}`);
		}

		return this.config_sections[section][key];
	}

	gen(): string {
		let output = "";
		for (const section in this.config_sections) {
			output += `:${section}\n`;
			for (const key in this.config_sections[section]) {
				output += `${key}=${JSON.stringify(this.config_sections[section][key])}\n`;
			}
			output += "\n";
		}
		return output;
	}

	get_table_name() {
		return "config";
	}

	async backup(table: supabaseTable, id: number) {
		for (const sect in this.config_sections) {
			for (const key in this.config_sections[sect]) {
				log("config", "backing up :" + sect + ":" + key);
				await table.items().add({
					key: key,
					section: sect,
					config: JSON.stringify(this.config_sections[sect][key]),
					backup_id: id,
					id: random_id(),
				});
			}
		}
	}
}

export let config: ConfigParser;
export function init_config(config_file: string): void {
	log("config", "Loading config from " + config_file);

	config = new ConfigParser(Deno.readTextFileSync(config_file));
	config.parse();
}
