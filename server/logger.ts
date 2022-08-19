export function log(module: string, message: string): void  {
	console.log(message.split("\n").map(line =>`[${module}] ${line}`).join("\n"));

	Deno.writeTextFileSync(`./logs/${module}.txt`, message.split("\n").map(line =>`[${new Date().toLocaleString()}] ${line}`).join("\n") + "\n", { append: true });
}