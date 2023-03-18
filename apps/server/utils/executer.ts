export async function runCommand(command: string) {
	// console.log("cmd: " + command);
	const proc = Deno.run({
		cmd: command.split(" ").filter((v) => v != ""),
		stderr: "null",
		stdout: "piped",
	});

	const status = await proc.status();
	const stdout = new TextDecoder().decode(await proc.output());
	proc.close();
	if (!status.success) {
		throw new Error("Could not execute: " + command);
	}

	return stdout;
}
