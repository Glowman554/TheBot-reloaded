export function run(command: string) {
	var file = "/tmp/" + Math.floor(Math.random() * 99999999) + ".sh";
	console.log("Running: '" + command + "' using file " + file);
	Deno.writeTextFileSync(file, command);
	return Deno.run({
		cmd: ["bash", file],
		cwd: "/tmp/",
		stdout: "piped",
		stderr: "piped",
	});
}
