import { runCommand } from "./utils/executer.ts";

var branch = (await runCommand("git rev-parse --abbrev-ref HEAD")).replace("\n", "");
var commit = (await runCommand("git rev-parse --short HEAD")).replace("\n", "");
var url = (await runCommand("git remote get-url origin")).replace("\n", "");

let dirty = false;
try {
	await runCommand("git diff --quiet");
} catch (e) {
	dirty = true;
}

Deno.writeTextFileSync("version.ts", `export const version = '${url} @ ${branch}:${commit} (${dirty ? "dirty" : "clean"})';`);
