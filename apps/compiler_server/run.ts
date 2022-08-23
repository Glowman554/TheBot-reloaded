export function run(command: string) {
	console.log('Running: ' + command);
	Deno.writeTextFileSync("/tmp/run.sh", command);
	return Deno.run({
		cmd: ["bash", "/tmp/run.sh"],
		cwd: "/tmp/",
		stdout:"piped",
		stderr:"piped",
	});
}