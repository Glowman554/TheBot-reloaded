import { log } from "../logger.ts";
import { config } from "../config/config.ts";

const tmp_files: {
	file: string;
	created: number;
	expire: number;
}[] = [];

export function init_tmp_files(): void {
	log("tmp", "Initializing temporary files");
	setInterval(() => {
		const now = Date.now();
		const tmp_files_cpy = Object.assign([], tmp_files) as {
			file: string;
			created: number;
			expire: number;
		}[];
		for (let i = 0; i < tmp_files_cpy.length; i++) {
			const file = tmp_files_cpy[i];
			if (now - file.created > file.expire) {
				log("tmp", "Deleting expired tmp file: " + file.file);
				try {
					Deno.removeSync(file.file);
					// deno-lint-ignore no-empty
				} catch (_e) {}
				tmp_files.splice(i, 1);
				break;
			}
		}
	}, 1000);

	for (const i of Deno.readDirSync(config.get("tmp_folder"))) {
		const file = config.get("tmp_folder") + "/" + i.name;
		log("tmp", "Deleting " + file);
		Deno.removeSync(file);
	}
}

export function get_temp_file(extension: string, expire_after = 1000 * 60): string {
	let tmp_dir = String(config ? config.get("tmp_folder") : "./tmp");
	if (!tmp_dir.endsWith("/")) {
		tmp_dir += "/";
	}

	const file = tmp_dir + Math.random().toString(36).substring(2) + "." + extension;
	log("tmp", "Returning temp file " + file + " gets deleted after " + (expire_after / 1000 / 60) + "m");

	tmp_files.push({
		file: file,
		created: Date.now(),
		expire: expire_after,
	});

	return file;
}
