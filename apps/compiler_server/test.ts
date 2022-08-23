fetch("http://localhost:3566/compiler/run", {
	body: "ls",
	method: "POST",
}).then((res) =>
	res.json().then((res) => {
		console.log(res.stdout);
		console.log(res.stderr);
	})
);

fetch("http://localhost:3566/compiler/run-nojail", {
	body: "cat /etc/os-release",
	method: "POST",
}).then((res) =>
	res.json().then((res) => {
		console.log(res.stdout);
		console.log(res.stderr);
	})
);

fetch("http://localhost:3566/compiler/compile", {
	body: JSON.stringify({
		prog: 'print("hello from python")',
		file: "test.py",
	}),
	method: "POST",
}).then((res) =>
	res.json().then((res) => {
		console.log(res.stdout);
		console.log(res.stderr);
	})
);

fetch("http://localhost:3566/compiler/compile", {
	body: JSON.stringify({
		prog: '#include <stdio.h>\nint main() { printf("hello from c"); return 0; }',
		file: "test.c",
	}),
	method: "POST",
}).then((res) =>
	res.json().then((res) => {
		console.log(res.stdout);
		console.log(res.stderr);
	})
);
