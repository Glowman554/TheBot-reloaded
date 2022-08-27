import { init_mikki_api } from "../../api/mikki.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";

export default class Mikki implements loadable {
	load(): void {
		init_mikki_api(config.get("url", "mikki") as string, config.get("token", "mikki") as string);
	}
}