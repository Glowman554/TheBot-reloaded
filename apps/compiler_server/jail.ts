var default_jail = [
	"-l 0",
	"--chroot /",
	"--user 0",
	"--group 99999",
	"-T /dev/",
];

var filter = [
	"$",
	"(",
	")",
	"'",
	'"',
	"|",
	"<",
	">",
	"`",
	"\\",
];

export function do_filter(str: string) {
	for (let i in filter) {
		if (str.indexOf(filter[i]) != -1) {
			throw new Error("This looks like code injection don't do that owo!");
		}
	}

	return str;
}

export function do_jail(command: string) {
	command = command.replace(/\'/g, '"');
	var cmd = "echo '" + command + "' | /bin/nsjail " + default_jail.join(" ") + " -- /bin/bash";
	return cmd;
}
