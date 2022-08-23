fetch("http://localhost:3566/compiler/run", {
	body: "ls",
	method: "POST",
}).then((res) => res.json().then((res) => console.log(res.stdout)));

fetch("http://localhost:3566/compiler/run-nojail", {
	body: "cat /etc/os-release | grep ubuntu",
	method: "POST",
}).then((res) => res.json().then((res) => console.log(res.stdout)));

fetch("http://localhost:3566/compiler/compile", {
	body: JSON.stringify({
		prog: "console.log(\"hello from js\");",
		file: "test.js"
	}),
	method: "POST",
}).then((res) => res.json().then((res) => console.log(res.stdout)));


fetch("http://localhost:3566/compiler/compile", {
	body: JSON.stringify({
		prog: "#include <stdio.h>\nint main() { printf(\"hello from c\"); return 0; }",
		file: "test.c"
	}),
	method: "POST",
}).then((res) => res.json().then((res) => console.log(res.stdout)));
