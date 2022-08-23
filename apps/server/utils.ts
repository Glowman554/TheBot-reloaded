import { log } from "./logger.ts";
import { config } from "./config/config.ts";

export function get_file_extension(file: string): string {
	return file.split(".").pop() || "";
}

var tmp_files: {
	file: string;
	created: number;
	expire: number;
}[] = [];

var expire_interval: number;
export function init_tmp_files(): void {
	log("tmp", "Initializing temporary files");
	expire_interval = setInterval(() => {
		var now = Date.now();
		var tmp_files_cpy = Object.assign([], tmp_files) as {
			file: string;
			created: number;
			expire: number;
		}[];
		for (var i = 0; i < tmp_files_cpy.length; i++) {
			var file = tmp_files_cpy[i];
			if (now - file.created > file.expire) {
				log("tmp", "Deleting expired tmp file: " + file.file);
				try {
					Deno.removeSync(file.file);
				} catch (e) {}
				tmp_files.splice(i, 1);
				break;
			}
		}
	}, 1000);
}

export function get_temp_file(extension: string, expire_after = 1000 * 60): string {
	var tmp_dir = String(config ? config.get("tmp_folder") : "./tmp");
	if (!tmp_dir.endsWith("/")) {
		tmp_dir += "/";
	}

	var file = tmp_dir + Math.random().toString(36).substring(2) + "." + extension;
	log("tmp", "Returning temp file " + file + " gets deleted after " + (expire_after / 1000 / 60) + "m");

	tmp_files.push({
		file: file,
		created: Date.now(),
		expire: expire_after,
	});

	return file;
}
