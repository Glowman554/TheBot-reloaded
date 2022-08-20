import { download } from "https://deno.land/x/download/mod.ts";
import { get_file_extension, get_temp_file } from "../utils.ts";
import { log } from "../logger.ts";

export async function download_to_tmp_file(url: string, ttl = 1000 * 60): Promise<string> {
	var file = get_temp_file(get_file_extension(url), ttl);
	log("download", `Downloading ${url} to ${file}`);
	await download(url, {
		dir: file.split("/").slice(0, -1).join("/"),
		file: file.split("/").pop() as string
	});

	return file;
}