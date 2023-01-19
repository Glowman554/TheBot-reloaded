import { log } from "../logger.ts";
import { config } from "./config.ts";

export interface Keystore {
	[key: string]: string;
}

let keystore: Keystore | null = null;

function keystore_load() {
	let keystore_file = config.get("keystore");

	keystore = {};

	try {
		if (Deno.statSync(keystore_file).isFile) {
			log("keystore", "Loading keystore from " + keystore_file);

			let ks = Deno.readTextFileSync(keystore_file);
			for (let line of ks.split("\n")) {
				let split = line.split("=", 2);
				if (split.length == 2) {
					log("keystore", "Found " + split[0] + " = " + split[1]);
					keystore[split[0]] = JSON.parse(split[1]) as string;
				}
			}
		}
	} catch (e) {}
}

function keystore_save() {
	let keystore_file = config.get("keystore");
	log("keystore", "Saving keystore in " + keystore_file);

	let str = "";

	for (let key in keystore) {
		str += key + "=" + JSON.stringify(keystore[key]) + "\n";
	}

	Deno.writeTextFileSync(keystore_file, str);
}

export function keystore_get(key: string): string | null {
	if (keystore) {
		return keystore[key];
	} else {
		keystore_load();
		return keystore_get(key);
	}
}

export function keystore_set(key: string, value: string) {
	if (keystore) {
		keystore[key] = value;
		keystore_save();
	} else {
		keystore_load();
		keystore_set(key, value);
	}
}
